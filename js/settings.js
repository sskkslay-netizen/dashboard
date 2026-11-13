/* General privacy settings and browser-local character management. */
(function () {
    "use strict";

    const DEVELOPER_CODE = "1800";

    function showMessage(id, message, isError = false) {
        const element = document.getElementById(id);
        element.textContent = message;
        element.classList.toggle("error", isError);
    }

    function renderCustomCharacters() {
        const list = document.getElementById("customCharacterList");
        const characters = StudyArchive.data.customCharacters;
        list.innerHTML = characters.length
            ? characters.map(character => `<li><strong>${escapeHTML(character.name)}</strong><span>${escapeHTML(character.series)} · ${escapeHTML(character.rarity)}</span></li>`).join("")
            : "<li>No custom characters on this device yet.</li>";
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
        })[character]);
    }

    function makeCharacterId(name, series) {
        const base = `${series}-${name}`.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        const existing = new Set(Gacha.getAvailableCharacters().map(character => character.id));
        let id = `custom-${base}`;
        let suffix = 2;
        while (existing.has(id)) id = `custom-${base}-${suffix++}`;
        return id;
    }

    function validImagePath(value) {
        if (!value) return "../assets/characters/default-character.svg";
        if (/^(https?:\/\/|\.{1,2}\/|\/)/i.test(value)) return value;
        throw new Error("Use an http(s) image URL or a relative/absolute image path.");
    }

    function firebaseErrorMessage(error) {
        const messages = {
            "auth/email-already-in-use": "An account already exists for this email.",
            "auth/invalid-credential": "The email or password is incorrect.",
            "auth/invalid-email": "Enter a valid email address.",
            "auth/weak-password": "Choose a password with at least 6 characters.",
            "auth/too-many-requests": "Too many attempts. Wait a little and try again.",
            "auth/network-request-failed": "Could not connect to Firebase. Check your connection."
        };
        return messages[error.code] || error.message || "Firebase could not complete that request.";
    }

    async function initAccount() {
        const firebase = await window.FirebaseSyncReady;
        const form = document.getElementById("accountForm");
        const setupNotice = document.getElementById("firebaseSetupNotice");
        const signedIn = document.getElementById("accountSignedIn");
        const emailDisplay = document.getElementById("accountEmail");
        const passwordInput = document.getElementById("accountPassword");
        const resetButton = document.getElementById("resetPasswordButton");
        const signOutButton = document.getElementById("signOutButton");

        if (!firebase || !firebase.configured) {
            setupNotice.textContent = firebase?.getStatus().message ||
                "Firebase could not start. Check the browser console for details.";
            showMessage("accountMessage", setupNotice.textContent, true);
            form.querySelectorAll("button, input").forEach(control => {
                control.disabled = true;
            });
            resetButton.disabled = true;
            return;
        }

        setupNotice.hidden = true;
        const setBusy = busy => {
            form.querySelectorAll("button, input").forEach(control => {
                control.disabled = busy || Boolean(firebase.getCurrentUser());
            });
            resetButton.disabled = busy;
            signOutButton.disabled = busy;
        };

        firebase.subscribeToAuth(user => {
            const isSignedIn = Boolean(user);
            form.hidden = isSignedIn;
            resetButton.hidden = isSignedIn;
            signedIn.hidden = !isSignedIn;
            emailDisplay.hidden = !isSignedIn;
            emailDisplay.textContent = isSignedIn ? `Signed in as ${user.email}` : "";
            if (isSignedIn) passwordInput.value = "";
        });
        initSharedCardEditor(firebase);
        firebase.subscribeToStatus(syncStatus => {
            showMessage("syncMessage", syncStatus.message, syncStatus.isError);
        });

        form.addEventListener("submit", async event => {
            event.preventDefault();
            const submitter = event.submitter;
            const action = submitter?.dataset.authAction;
            const email = document.getElementById("accountEmailInput").value.trim();
            const password = passwordInput.value;
            setBusy(true);
            showMessage("accountMessage", action === "create-account"
                ? "Creating your account and syncing data..."
                : "Signing in and loading your saved data...");
            try {
                if (action === "create-account") await firebase.createAccount(email, password);
                else await firebase.signIn(email, password);
                showMessage("accountMessage", "Signed in. Your data is synced to Firebase.");
            } catch (error) {
                showMessage("accountMessage", firebaseErrorMessage(error), true);
            } finally {
                setBusy(false);
            }
        });

        signOutButton.addEventListener("click", async () => {
            signOutButton.disabled = true;
            try {
                await firebase.signOut();
                showMessage("accountMessage", "You have been signed out. Your browser data is unchanged.");
            } catch (error) {
                showMessage("accountMessage", firebaseErrorMessage(error), true);
            } finally {
                signOutButton.disabled = false;
            }
        });

        resetButton.addEventListener("click", async () => {
            const email = document.getElementById("accountEmailInput").value.trim();
            if (!email) {
                showMessage("accountMessage", "Enter your email address first.", true);
                document.getElementById("accountEmailInput").focus();
                return;
            }
            resetButton.disabled = true;
            try {
                await firebase.sendPasswordReset(email);
                showMessage("accountMessage", "Password reset email sent.");
            } catch (error) {
                showMessage("accountMessage", firebaseErrorMessage(error), true);
            } finally {
                resetButton.disabled = false;
            }
        });
    }

    function initSharedCardEditor(firebase) {
        const editor = document.getElementById("sharedCardEditor");
        const accessMessage = document.getElementById("sharedCardAccess");
        const select = document.getElementById("sharedCardSelect");
        const form = document.getElementById("sharedCardForm");
        const idInput = document.getElementById("sharedCardId");
        const deleteButton = document.getElementById("deleteSharedCard");
        let catalog = null;
        let selectedId = "";
        let creating = false;

        const getCatalog = () => catalog || Gacha.getSharedCharacters();

        function renderSelect() {
            const cards = getCatalog();
            const ready = firebase.sharedCardsReady;
            if (!cards.some(card => card.id === selectedId)) {
                selectedId = cards[0]?.id || "";
            }
            select.disabled = !ready;
            select.innerHTML = cards.map(card =>
                `<option value="${escapeHTML(card.id)}">${escapeHTML(card.name)} · ${escapeHTML(card.series)}</option>`
            ).join("");
            select.value = selectedId;
            form.querySelectorAll("input, select, textarea, button").forEach(control => {
                control.disabled = !ready;
            });
            document.getElementById("newSharedCard").disabled = !ready;
            deleteButton.disabled = !ready || !selectedId;
            accessMessage.textContent = ready
                ? "You can edit the shared catalog. Changes are visible to everyone using this Firebase project."
                : "Loading the shared card catalog...";
        }

        function loadCard(cardId) {
            const card = getCatalog().find(item => item.id === cardId);
            if (!card) return;
            creating = false;
            selectedId = card.id;
            form.elements.name.value = card.name;
            form.elements.series.value = card.series;
            form.elements.rarity.value = card.rarity;
            form.elements.title.value = card.title;
            form.elements.description.value = card.description;
            form.elements.image.value = card.image;
            idInput.value = card.id;
            idInput.readOnly = true;
            deleteButton.hidden = false;
            renderSelect();
        }

        function startNewCard() {
            creating = true;
            selectedId = "";
            form.reset();
            idInput.readOnly = false;
            deleteButton.hidden = true;
            renderSelect();
            document.getElementById("sharedCardName").focus();
        }

        firebase.subscribeToAuth(() => {
            const canEdit = firebase.isDeveloper;
            editor.hidden = !canEdit;
            accessMessage.textContent = canEdit
                ? "You can edit the shared catalog. Changes are visible to everyone using this Firebase project."
                : firebase.getCurrentUser()
                    ? "This account is not authorized to edit shared cards. Add its Firebase Auth UID to both developer allowlists."
                    : "Sign in with an authorized developer account to edit shared cards.";
        });

        firebase.subscribeToSharedCards(cards => {
            catalog = cards;
            renderSelect();
            if (creating) return;
            if (selectedId) loadCard(selectedId);
            else if (getCatalog().length) loadCard(getCatalog()[0].id);
        });

        select.addEventListener("change", () => loadCard(select.value));
        document.getElementById("newSharedCard").addEventListener("click", startNewCard);

        form.addEventListener("submit", async event => {
            event.preventDefault();
            const submitButton = form.querySelector('[type="submit"]');
            submitButton.disabled = true;
            const values = new FormData(form);
            const name = String(values.get("name") || "").trim();
            const series = String(values.get("series") || "").trim();
            const card = {
                id: creating ? String(values.get("id") || "").trim() ||
                    makeCharacterId(name, series) : selectedId,
                name,
                series,
                rarity: String(values.get("rarity")),
                title: String(values.get("title") || "").trim(),
                description: String(values.get("description") || "").trim(),
                image: validImagePath(String(values.get("image") || "").trim())
            };
            try {
                if (!card.name || !card.series || !card.title || !card.description) {
                    throw new Error("Complete the name, series, title, and description.");
                }
                if (!/^[a-z0-9][a-z0-9_-]*$/i.test(card.id)) {
                    throw new Error("Use letters, numbers, hyphens, or underscores for the card ID.");
                }
                if (!["SSR", "SR", "R"].includes(card.rarity)) {
                    throw new Error("Choose a valid card rarity.");
                }
                if (creating) {
                    await firebase.addSharedCard(card, getCatalog());
                    selectedId = card.id;
                    creating = false;
                } else {
                    await firebase.updateSharedCard(card, getCatalog());
                }
                showMessage("sharedCardMessage", `${card.name} was saved to the shared catalog.`);
                loadCard(card.id);
            } catch (error) {
                showMessage("sharedCardMessage", error.message, true);
            } finally {
                submitButton.disabled = false;
            }
        });

        deleteButton.addEventListener("click", async () => {
            const card = getCatalog().find(item => item.id === selectedId);
            if (!card || !window.confirm(`Remove ${card.name} from the shared catalog?`)) return;
            deleteButton.disabled = true;
            try {
                await firebase.deleteSharedCard(card.id, getCatalog());
                showMessage("sharedCardMessage", `${card.name} was removed from the shared catalog.`);
            } catch (error) {
                showMessage("sharedCardMessage", error.message, true);
            } finally {
                deleteButton.disabled = false;
            }
        });
    }

    function init() {
        StudyArchive.init();
        Gacha.init();
        void initAccount().catch(error => {
            showMessage("accountMessage", firebaseErrorMessage(error), true);
            console.error(error);
        });
        document.getElementById("incognitoToggle").checked =
            StudyArchive.data.incognitoMode === true;
        renderCustomCharacters();

        document.getElementById("incognitoToggle").addEventListener("change", event => {
            try {
                StudyArchive.setIncognitoMode(event.currentTarget.checked);
                showMessage("incognitoMessage", event.currentTarget.checked
                    ? "Incognito mode is on. Study pages and crystal rewards are unchanged."
                    : "Incognito mode is off. Character pages are visible again.");
            } catch (error) {
                event.currentTarget.checked = !event.currentTarget.checked;
                showMessage("incognitoMessage", error.message, true);
            }
        });

        document.getElementById("developerUnlockForm").addEventListener("submit", event => {
            event.preventDefault();
            const input = document.getElementById("developerCode");
            if (input.value !== DEVELOPER_CODE) {
                showMessage("developerMessage", "That code is not correct.", true);
                input.select();
                return;
            }
            input.value = "";
            document.getElementById("developerWorkspace").hidden = false;
            showMessage("developerMessage", "Developer mode unlocked for this browser.");
            document.getElementById("newCharacterName").focus();
        });

        document.getElementById("lockDeveloperMode").addEventListener("click", () => {
            document.getElementById("developerWorkspace").hidden = true;
            showMessage("developerMessage", "Developer mode locked.");
            document.getElementById("developerCode").focus();
        });

        document.getElementById("addCharacterForm").addEventListener("submit", event => {
            event.preventDefault();
            const values = new FormData(event.currentTarget);
            const name = String(values.get("name") || "").trim();
            const series = String(values.get("series") || "").trim();
            const title = String(values.get("title") || "").trim();
            const description = String(values.get("description") || "").trim();
            try {
                if (!name || !series || !title || !description) {
                    throw new Error("Complete the name, series, title, and description.");
                }
                const added = Gacha.addCharacter({
                    id: makeCharacterId(name, series),
                    name,
                    series,
                    rarity: String(values.get("rarity")),
                    title,
                    description,
                    image: validImagePath(String(values.get("image") || "").trim())
                });
                if (!added) throw new Error("That character could not be added. Check its details and try again.");
                event.currentTarget.reset();
                renderCustomCharacters();
                showMessage("addCharacterMessage", `${name} was added to this browser's pull pool.`);
            } catch (error) {
                showMessage("addCharacterMessage", error.message, true);
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        try {
            init();
        } catch (error) {
            showMessage("developerMessage", error.message, true);
            console.error(error);
        }
    });
}());
