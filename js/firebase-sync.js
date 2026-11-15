import { developerUids, firebaseConfig } from "./firebase-config.js";

const STORAGE_KEYS = ["studyArchiveData", "studyArchiveACT"];
const LEGACY_MIGRATED_KEY = "studyArchiveLegacyMigrated";
const ACTIVE_USER_KEY = "studyArchiveActiveUid";
const MAX_PAYLOAD_BYTES = 850 * 1024;
const MAX_USER_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_USER_FILE_TYPES = new Set([
    "application/pdf",
    "text/plain",
    "text/markdown",
    "text/csv",
    "application/rtf",
    "application/msword",
    "application/vnd.ms-excel",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
]);
const SHARED_CARDS_PATH = "sharedData/cards";
const isConfigured = Object.values(firebaseConfig).every(value =>
    typeof value === "string" &&
    value.length > 0 &&
    !value.startsWith("YOUR_")
);

let auth;
let authSdk;
let authReady = Promise.resolve();
let db;
let currentUser = null;
let status = { message: "", isError: false };
const authListeners = new Set();
const statusListeners = new Set();
const writeQueues = new Map();
let activeSyncUid = "";
let activeSyncPromise = null;
let readyUserUid = "";
let pendingAccountSwitchUid = "";
let firestore;
let app;
let storage;
let storageSdk;
let storageReady = null;
let sharedCards = null;
let sharedCardsReady = false;
const sharedCardsListeners = new Set();

function updateStatus(message, isError = false) {
    status = { message, isError };
    statusListeners.forEach(listener => listener(status));
    if (isError) console.error(message);
}

function showAccountSyncFailure(userUid, error) {
    if (pendingAccountSwitchUid !== userUid || !document.body) return;

    document.documentElement.style.visibility = "";
    const panel = document.createElement("main");
    panel.setAttribute("role", "alert");
    panel.style.cssText = "max-width:36rem;margin:15vh auto;padding:2rem;font:16px/1.5 system-ui,sans-serif;color:#222;background:#fff;border:1px solid #bbb;border-radius:12px";
    const heading = document.createElement("h1");
    heading.textContent = "Your account data could not be loaded";
    const message = document.createElement("p");
    message.textContent = `${error.message} Reload this page after checking your connection.`;
    const retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = "Reload page";
    retry.addEventListener("click", () => window.location.reload());
    panel.append(heading, message, retry);
    document.body.replaceChildren(panel);
}

function notifyAuthListeners() {
    authListeners.forEach(listener => listener(currentUser));
}

function subscribeToAuth(listener) {
    authListeners.add(listener);
    listener(currentUser);
    return () => authListeners.delete(listener);
}

function subscribeToStatus(listener) {
    statusListeners.add(listener);
    listener(status);
    return () => statusListeners.delete(listener);
}

function serializePayload(data) {
    const payload = JSON.stringify(data);
    if (new TextEncoder().encode(payload).byteLength > MAX_PAYLOAD_BYTES) {
        throw new Error("This data is too large to sync to Firestore. Remove some saved images or data and try again.");
    }
    return payload;
}

function localPayload(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        throw new Error(`Could not read ${key} from this browser.`, { cause: error });
    }
}

function accountCacheKey(uid, key) {
    return `studyArchiveAccount:${uid}:${key}`;
}

function accountPayload(uid, key) {
    try {
        return localStorage.getItem(accountCacheKey(uid, key));
    } catch (error) {
        throw new Error(`Could not read the saved ${key} data for this account.`, { cause: error });
    }
}

function cacheAccountPayload(uid, key, payload) {
    try {
        localStorage.setItem(key, payload);
        localStorage.setItem(accountCacheKey(uid, key), payload);
    } catch (error) {
        throw new Error(`Could not cache the saved ${key} data for this account.`, { cause: error });
    }
}

function dataReference(uid, key) {
    return firestore.doc(db, `users/${uid}/data/${key}`);
}

function notifySharedCardsListeners() {
    sharedCardsListeners.forEach(listener => listener(sharedCards));
}

function isValidCard(card) {
    return card && typeof card === "object" &&
        typeof card.id === "string" && /^[a-z0-9][a-z0-9_-]*$/i.test(card.id) &&
        typeof card.name === "string" &&
        typeof card.series === "string" &&
        ["SSR", "SR", "R"].includes(card.rarity) &&
        typeof card.title === "string" &&
        typeof card.description === "string" &&
        typeof card.image === "string" &&
        /^(https?:\/\/|\.{1,2}\/|\/)/i.test(card.image);
}

function subscribeToSharedCards(listener) {
    sharedCardsListeners.add(listener);
    listener(sharedCards);
    return () => sharedCardsListeners.delete(listener);
}

function sharedCardsReference() {
    return firestore.doc(db, SHARED_CARDS_PATH);
}

function initializeStorage() {
    if (!storageReady) {
        storageReady = import("https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js")
            .then(sdk => {
                storageSdk = sdk;
                storage = storageSdk.getStorage(app);
            })
            .catch(error => {
                storageReady = null;
                throw error;
            });
    }
    return storageReady;
}

function userFilesReference(uid) {
    return storageSdk.ref(storage, `users/${uid}/files`);
}

function userFileReference(path, uid) {
    const prefix = `users/${uid}/files/`;
    if (typeof path !== "string" || !path.startsWith(prefix) ||
        path.includes("..") || path.endsWith("/")) {
        throw new Error("The file path is invalid for this account.");
    }
    return storageSdk.ref(storage, path);
}

async function changeSharedCard(action, cardId, card, fallbackCards) {
    if (!currentUser || !developerUids.includes(currentUser.uid)) {
        throw new Error("Only an authorized developer account can edit shared cards.");
    }

    if (!Array.isArray(fallbackCards) || !fallbackCards.every(isValidCard)) {
        throw new Error("The shared card catalog is invalid.");
    }

    const ref = sharedCardsReference();
    await firestore.runTransaction(db, async transaction => {
        const snapshot = await transaction.get(ref);
        let cards = fallbackCards.map(item => ({ ...item }));
        if (snapshot.exists()) {
            try {
                cards = JSON.parse(snapshot.data().payload);
            } catch (error) {
                throw new Error("The shared card catalog could not be read.", { cause: error });
            }
            if (!Array.isArray(cards) || !cards.every(isValidCard)) {
                throw new Error("The shared card catalog has an invalid format.");
            }
        }

        const existingIndex = cards.findIndex(item => item.id === cardId);
        if (action === "delete") {
            if (existingIndex < 0) throw new Error("That shared card no longer exists.");
            cards.splice(existingIndex, 1);
        } else {
            if (!isValidCard(card)) throw new Error("Complete all required card fields.");
            const duplicateId = cards.some((item, index) =>
                item.id === card.id && index !== existingIndex
            );
            if (duplicateId) throw new Error("A card with that ID already exists.");
            if (action === "update" && existingIndex < 0) {
                throw new Error("That shared card no longer exists.");
            }
            if (action === "add" && existingIndex >= 0) {
                throw new Error("A card with that ID already exists.");
            }
            if (existingIndex >= 0) cards[existingIndex] = card;
            else cards.push(card);
        }

        const payload = serializePayload(cards);
        transaction.set(ref, {
            payload,
            updatedAt: firestore.serverTimestamp()
        });
    });
}

async function writePayload(uid, key, payload) {
    const queueKey = `${uid}:${key}`;
    const previousWrite = writeQueues.get(queueKey) || Promise.resolve();
    const nextWrite = previousWrite
        .catch(() => {})
        .then(() => firestore.setDoc(dataReference(uid, key), {
            payload,
            updatedAt: firestore.serverTimestamp()
        }));
    writeQueues.set(queueKey, nextWrite);

    try {
        await nextWrite;
        if (currentUser?.uid === uid) updateStatus("Your data is synced to Firebase.");
    } catch (error) {
        updateStatus(`Firebase could not save your data: ${error.message}`, true);
        throw error;
    } finally {
        if (writeQueues.get(queueKey) === nextWrite) writeQueues.delete(queueKey);
    }
}

async function syncUserData(user) {
    if (activeSyncUid === user.uid && activeSyncPromise) return activeSyncPromise;

    activeSyncUid = user.uid;
    activeSyncPromise = (async () => {
        const previousUid = localStorage.getItem(ACTIVE_USER_KEY);
        const legacyMigrated = localStorage.getItem(LEGACY_MIGRATED_KEY) === "true";
        const accountChanged = previousUid
            ? previousUid !== user.uid
            : legacyMigrated;
        if (accountChanged) {
            pendingAccountSwitchUid = user.uid;
            document.documentElement.style.visibility = "hidden";
        }
        const legacyPayloads = legacyMigrated
            ? null
            : STORAGE_KEYS.map(key => localPayload(key));

        updateStatus("Loading your saved data from Firebase...");
        const snapshots = await Promise.all(
            STORAGE_KEYS.map(key => firestore.getDoc(dataReference(user.uid, key)))
        );
        if (currentUser?.uid !== user.uid) return;

        let shouldReload = accountChanged;

        for (const [index, key] of STORAGE_KEYS.entries()) {
            const snapshot = snapshots[index];
            const cachedPayload = accountPayload(user.uid, key);
            let payload;

            if (snapshot.exists()) {
                payload = snapshot.data().payload;
                if (typeof payload !== "string") {
                    throw new Error(`The saved ${key} record has an invalid format.`);
                }
            } else if (cachedPayload !== null) {
                payload = cachedPayload;
                await writePayload(user.uid, key, payload);
            } else if (!legacyMigrated) {
                payload = legacyPayloads[index];
                if (payload !== null) await writePayload(user.uid, key, payload);
            } else if (!accountChanged && previousUid === user.uid) {
                payload = localPayload(key);
                if (payload !== null) await writePayload(user.uid, key, payload);
            } else {
                payload = null;
            }

            if (payload === null) {
                if (localPayload(key) !== null) {
                    localStorage.removeItem(key);
                    shouldReload = true;
                }
                continue;
            }

            if (localPayload(key) !== payload) shouldReload = true;
            cacheAccountPayload(user.uid, key, payload);
        }

        if (!legacyMigrated) localStorage.setItem(LEGACY_MIGRATED_KEY, "true");
        localStorage.setItem(ACTIVE_USER_KEY, user.uid);
        readyUserUid = user.uid;
        pendingAccountSwitchUid = "";

        if (shouldReload) window.location.reload();
        updateStatus("Your data is synced to Firebase.");
    })().catch(error => {
        updateStatus(`Firebase sync failed to finish: ${error.message}`, true);
        showAccountSyncFailure(user.uid, error);
        throw error;
    }).finally(() => {
        if (activeSyncUid === user.uid) {
            activeSyncUid = "";
            activeSyncPromise = null;
        }
    });

    return activeSyncPromise;
}

async function importSharedCards(importedCards, fallbackCards) {
    if (!currentUser || !developerUids.includes(currentUser.uid)) {
        throw new Error("Only an authorized developer account can edit shared cards.");
    }
    if (!Array.isArray(fallbackCards) || !fallbackCards.every(isValidCard)) {
        throw new Error("The shared card catalog is invalid.");
    }
    if (!Array.isArray(importedCards) || !importedCards.length ||
        !importedCards.every(isValidCard)) {
        throw new Error("The import must contain at least one valid card.");
    }

    const importedIds = new Set();
    for (const card of importedCards) {
        if (importedIds.has(card.id)) {
            throw new Error(`The import contains duplicate card ID "${card.id}".`);
        }
        importedIds.add(card.id);
    }

    const ref = sharedCardsReference();
    await firestore.runTransaction(db, async transaction => {
        const snapshot = await transaction.get(ref);
        let cards = fallbackCards.map(item => ({ ...item }));
        if (snapshot.exists()) {
            try {
                cards = JSON.parse(snapshot.data().payload);
            } catch (error) {
                throw new Error("The shared card catalog could not be read.", { cause: error });
            }
            if (!Array.isArray(cards) || !cards.every(isValidCard)) {
                throw new Error("The shared card catalog has an invalid format.");
            }
        }

        const cardIndexes = new Map(cards.map((card, index) => [card.id, index]));
        for (const card of importedCards) {
            const existingIndex = cardIndexes.get(card.id);
            if (existingIndex === undefined) {
                cardIndexes.set(card.id, cards.length);
                cards.push(card);
            } else {
                cards[existingIndex] = card;
            }
        }

        transaction.set(ref, {
            payload: serializePayload(cards),
            updatedAt: firestore.serverTimestamp()
        });
    });
}

function save(key, data) {
    if (!STORAGE_KEYS.includes(key) || !currentUser || !db ||
        readyUserUid !== currentUser.uid) return;
    let payload;
    try {
        payload = serializePayload(data);
        localStorage.setItem(accountCacheKey(currentUser.uid, key), payload);
    } catch (error) {
        updateStatus(`Firebase could not cache your data: ${error.message}`, true);
        return;
    }
    void writePayload(currentUser.uid, key, payload).catch(() => {});
}

const FirebaseSync = {
    get configured() {
        return isConfigured;
    },
    getCurrentUser() {
        return currentUser;
    },
    get isDeveloper() {
        return Boolean(currentUser && developerUids.includes(currentUser.uid));
    },
    get sharedCardsReady() {
        return sharedCardsReady;
    },
    getStatus() {
        return status;
    },
    subscribeToAuth,
    subscribeToStatus,
    subscribeToSharedCards,
    save,
    async updateSharedCard(card, fallbackCards) {
        await changeSharedCard("update", card.id, card, fallbackCards);
    },
    async addSharedCard(card, fallbackCards) {
        await changeSharedCard("add", card.id, card, fallbackCards);
    },
    async deleteSharedCard(cardId, fallbackCards) {
        await changeSharedCard("delete", cardId, null, fallbackCards);
    },
    async uploadSharedCardImage(file, cardId) {
        if (!currentUser || !developerUids.includes(currentUser.uid)) {
            throw new Error("Only an authorized developer account can upload shared card images.");
        }
        await initializeStorage();
        if (!/^[a-z0-9][a-z0-9_-]*$/i.test(cardId)) {
            throw new Error("The card ID is invalid.");
        }
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!file || typeof file.name !== "string" || !allowedTypes.includes(file.type) ||
            !Number.isFinite(file.size) || file.size <= 0) {
            throw new Error("Choose a JPEG, PNG, WebP, or GIF image.");
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new Error("Choose an image smaller than 5 MB.");
        }
        const filename = file.name.replace(/[^a-z0-9._-]/gi, "_").slice(-80) || "photo";
        const path = `shared-cards/${cardId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${filename}`;
        const reference = storageSdk.ref(storage, path);
        await storageSdk.uploadBytes(reference, file, {
            contentType: file.type,
            cacheControl: "public,max-age=31536000"
        });
        try {
            return {
                path,
                url: await storageSdk.getDownloadURL(reference)
            };
        } catch (error) {
            try {
                await storageSdk.deleteObject(reference);
            } catch (cleanupError) {
                throw new Error(
                    `The photo uploaded, but its download URL could not be created and the upload could not be removed: ${cleanupError.message}`,
                    { cause: error }
                );
            }
            throw error;
        }
    },
    async deleteSharedCardImage(path) {
        if (!currentUser || !developerUids.includes(currentUser.uid)) {
            throw new Error("Only an authorized developer account can remove shared card images.");
        }
        await initializeStorage();
        if (typeof path !== "string" || !path.startsWith("shared-cards/")) {
            throw new Error("The shared card image path is invalid.");
        }
        await storageSdk.deleteObject(storageSdk.ref(storage, path));
    },
    async uploadUserFile(file) {
        if (!currentUser) throw new Error("Sign in to upload files to your private library.");
        const uid = currentUser.uid;
        await initializeStorage();
        if (currentUser?.uid !== uid) throw new Error("Your account changed before the file upload could start.");
        if (!file || typeof file.name !== "string" ||
            !ALLOWED_USER_FILE_TYPES.has(file.type) ||
            !Number.isFinite(file.size) || file.size <= 0) {
            throw new Error("Choose a supported document or image file.");
        }
        if (file.size > MAX_USER_FILE_BYTES) {
            throw new Error("Choose a file smaller than 20 MB.");
        }

        const safeName = file.name
            .replace(/[^\w.-]+/g, "_")
            .replace(/^\.+/, "")
            .slice(-100) || "file";
        const path = `users/${uid}/files/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}`;
        const reference = userFileReference(path, uid);
        await storageSdk.uploadBytes(reference, file, {
            contentType: file.type,
            cacheControl: "private,max-age=0",
            customMetadata: {
                originalName: file.name.slice(0, 200)
            }
        });
        return {
            path,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
        };
    },
    async listUserFiles() {
        if (!currentUser) throw new Error("Sign in to view your private files.");
        const uid = currentUser.uid;
        await initializeStorage();
        if (currentUser?.uid !== uid) throw new Error("Your account changed before your files could load.");
        const result = await storageSdk.listAll(userFilesReference(uid));
        const files = await Promise.all(result.items.map(async reference => {
            const metadata = await storageSdk.getMetadata(reference);
            return {
                path: reference.fullPath,
                name: metadata.customMetadata?.originalName || reference.name,
                size: metadata.size,
                type: metadata.contentType || "",
                uploadedAt: metadata.timeCreated || ""
            };
        }));
        return files.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    },
    async downloadUserFile(path) {
        if (!currentUser) throw new Error("Sign in to download your private files.");
        const uid = currentUser.uid;
        await initializeStorage();
        if (currentUser?.uid !== uid) throw new Error("Your account changed before the download could start.");
        const reference = userFileReference(path, uid);
        const metadata = await storageSdk.getMetadata(reference);
        if (metadata.size > MAX_USER_FILE_BYTES) {
            throw new Error("This file is larger than the supported download size.");
        }
        const bytes = await storageSdk.getBytes(reference, MAX_USER_FILE_BYTES);
        return {
            blob: new Blob([bytes], { type: metadata.contentType || "application/octet-stream" }),
            name: metadata.customMetadata?.originalName || reference.name
        };
    },
    async deleteUserFile(path) {
        if (!currentUser) throw new Error("Sign in to delete files from your private library.");
        const uid = currentUser.uid;
        await initializeStorage();
        if (currentUser?.uid !== uid) throw new Error("Your account changed before the file could be deleted.");
        await storageSdk.deleteObject(userFileReference(path, uid));
    },
    async importSharedCards(cards, fallbackCards) {
        await importSharedCards(cards, fallbackCards);
    },
    async createAccount(email, password) {
        if (!isConfigured) throw new Error("Add your Firebase project settings before creating an account.");
        await authReady;
        const result = await authSdk.createUserWithEmailAndPassword(auth, email, password);
        await syncUserData(result.user);
        return result.user;
    },
    async signIn(email, password) {
        if (!isConfigured) throw new Error("Add your Firebase project settings before signing in.");
        await authReady;
        const result = await authSdk.signInWithEmailAndPassword(auth, email, password);
        await syncUserData(result.user);
        return result.user;
    },
    async sendPasswordReset(email) {
        if (!isConfigured) throw new Error("Add your Firebase project settings before resetting a password.");
        await authReady;
        await authSdk.sendPasswordResetEmail(auth, email);
    },
    async signOut() {
        if (!isConfigured) return;
        await authSdk.signOut(auth);
    }
};

window.FirebaseSync = FirebaseSync;

if (isConfigured) {
    const [appSdk, loadedAuthSdk, loadedFirestore] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js")
    ]);

    app = appSdk.initializeApp(firebaseConfig);
    authSdk = loadedAuthSdk;
    firestore = loadedFirestore;
    auth = authSdk.getAuth(app);
    db = firestore.getFirestore(app);
    authReady = authSdk.setPersistence(auth, authSdk.browserLocalPersistence);

    firestore.onSnapshot(sharedCardsReference(), snapshot => {
        if (!snapshot.exists()) {
            sharedCards = null;
            sharedCardsReady = true;
            notifySharedCardsListeners();
            return;
        }
        try {
            const cards = JSON.parse(snapshot.data().payload);
            if (!Array.isArray(cards) || !cards.every(isValidCard)) {
                throw new Error("The shared card catalog has an invalid format.");
            }
            sharedCards = cards;
            sharedCardsReady = true;
            notifySharedCardsListeners();
        } catch (error) {
            updateStatus(`Shared card catalog could not be loaded: ${error.message}`, true);
        }
    }, error => {
        updateStatus(
            `Shared card catalog could not be loaded: ${error.message}. Check that Firestore rules allow reading sharedData/cards.`,
            true
        );
    });

    authSdk.onAuthStateChanged(auth, user => {
        currentUser = user;
        readyUserUid = "";
        notifyAuthListeners();
        if (user) {
            void syncUserData(user).catch(() => {});
        } else {
            readyUserUid = "";
            activeSyncUid = "";
            activeSyncPromise = null;
            updateStatus("Sign in to sync your data to Firebase.");
        }
    }, error => {
        updateStatus(`Firebase authentication failed: ${error.message}`, true);
    });
} else {
    updateStatus("Add your Firebase web app settings in js/firebase-config.js to enable account sync.");
}

export { FirebaseSync };
