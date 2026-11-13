import { firebaseConfig } from "./firebase-config.js";

const STORAGE_KEYS = ["studyArchiveData", "studyArchiveACT"];
const MAX_PAYLOAD_BYTES = 850 * 1024;
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
let firestore;

function updateStatus(message, isError = false) {
    status = { message, isError };
    statusListeners.forEach(listener => listener(status));
    if (isError) console.error(message);
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

function dataReference(uid, key) {
    return firestore.doc(db, `users/${uid}/data/${key}`);
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
        updateStatus("Loading your saved data from Firebase...");
        const snapshots = await Promise.all(
            STORAGE_KEYS.map(key => firestore.getDoc(dataReference(user.uid, key)))
        );
        const restoredKeys = [];

        for (const [index, key] of STORAGE_KEYS.entries()) {
            const snapshot = snapshots[index];
            if (snapshot.exists()) {
                const payload = snapshot.data().payload;
                if (typeof payload !== "string") {
                    throw new Error(`The saved ${key} record has an invalid format.`);
                }
                if (localPayload(key) !== payload) {
                    localStorage.setItem(key, payload);
                    restoredKeys.push(key);
                }
            } else {
                const payload = localPayload(key);
                if (payload !== null) await writePayload(user.uid, key, payload);
            }
        }

        if (restoredKeys.length) {
            window.StudyArchive?.init();
            window.ACTData?.init();
        }
        updateStatus("Your data is synced to Firebase.");
    })().catch(error => {
        updateStatus(`Firebase sync failed to finish: ${error.message}`, true);
        throw error;
    }).finally(() => {
        activeSyncUid = "";
        activeSyncPromise = null;
    });

    return activeSyncPromise;
}

function save(key, data) {
    if (!STORAGE_KEYS.includes(key) || !currentUser || !db) return;
    let payload;
    try {
        payload = serializePayload(data);
    } catch (error) {
        updateStatus(error.message, true);
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
    getStatus() {
        return status;
    },
    subscribeToAuth,
    subscribeToStatus,
    save,
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

    const app = appSdk.initializeApp(firebaseConfig);
    authSdk = loadedAuthSdk;
    firestore = loadedFirestore;
    auth = authSdk.getAuth(app);
    db = firestore.getFirestore(app);
    authReady = authSdk.setPersistence(auth, authSdk.browserLocalPersistence);

    authSdk.onAuthStateChanged(auth, user => {
        currentUser = user;
        notifyAuthListeners();
        if (user) {
            void syncUserData(user).catch(() => {});
        } else {
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
