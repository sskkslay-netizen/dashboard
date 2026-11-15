(function () {
    "use strict";

    const DEFAULT_IMAGE = "../assets/characters/default-character.svg";
    const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
    const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    let firebase;
    let catalog = null;
    let selectedCard = null;
    let selectedId = "";
    let creating = true;
    let dirty = false;
    let busy = false;
    let canEdit = false;
    let pendingImport = null;
    let pendingImageFile = null;
    let previewObjectUrl = "";

    const byId = id => document.getElementById(id);
    const form = byId("sharedCardForm");
    const workspace = byId("sharedCardEditor");
    const list = byId("sharedCardList");
    const imageInput = byId("sharedCardImage");
    const imageFileInput = byId("sharedCardImageFile");
    const imagePreview = byId("sharedCardPreview");
    const imageEmpty = byId("sharedCardPreviewEmpty");

    function showMessage(id, message, isError = false) {
        const element = byId(id);
        element.textContent = message;
        element.classList.toggle("error", isError);
    }

    function sharedCardErrorMessage(error) {
        if (error?.code === "storage/unauthorized") {
            return "Firebase Storage denied the photo upload. Publish storage.rules and confirm your developer UID is allowlisted.";
        }
        if (["storage/bucket-not-found", "storage/no-default-bucket"].includes(error?.code)) {
            return "Firebase Storage is not set up for this project yet. Create its Storage bucket, then publish storage.rules.";
        }
        if (error?.code === "permission-denied") {
            return "Firebase denied this change. Publish the Firestore rules in the Firebase Console and confirm your developer UID is allowlisted.";
        }
        return error?.message || "The shared card change could not be completed.";
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
        })[character]);
    }

    function getCards() {
        return catalog ?? Gacha.getSharedCharacters();
    }

    function makeCardId(name, series, usedIds = new Set(getCards().map(card => card.id))) {
        const slug = `${series}-${name}`.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "new-card";
        const base = slug.slice(0, 80).replace(/-+$/g, "") || "new-card";
        let id = base;
        let suffix = 2;
        while (usedIds.has(id)) {
            const suffixText = `-${suffix++}`;
            id = `${base.slice(0, 80 - suffixText.length)}${suffixText}`;
        }
        usedIds.add(id);
        return id;
    }

    function normalizeImage(value) {
        const image = value.trim();
        if (!image) return DEFAULT_IMAGE;
        if (/^https?:\/\//i.test(image)) {
            let url;
            try {
                url = new URL(image);
            } catch (error) {
                throw new Error("Enter a valid http(s) image URL or a relative site path.", { cause: error });
            }
            if (!url.hostname) throw new Error("Enter a valid image URL with a hostname.");
            return image;
        }
        if (/^(?:\.{1,2}\/|\/)/.test(image)) return image;
        throw new Error("Use an http(s) image URL or a relative/absolute site path.");
    }

    function validateCard(card) {
        const limits = {
            id: 80,
            name: 60,
            series: 60,
            title: 80,
            description: 500,
            image: 500
        };
        for (const [field, maxLength] of Object.entries(limits)) {
            if (card[field].length > maxLength) {
                throw new Error(`${field[0].toUpperCase()}${field.slice(1)} must be ${maxLength} characters or fewer.`);
            }
        }
        if (!/^[a-z0-9][a-z0-9_-]*$/i.test(card.id)) {
            throw new Error("Card IDs can use letters, numbers, hyphens, and underscores.");
        }
        for (const field of ["name", "series", "title", "description"]) {
            if (!card[field]) throw new Error(`Enter a ${field}.`);
        }
        if (!["SSR", "SR", "R"].includes(card.rarity)) {
            throw new Error("Choose SSR, SR, or R for rarity.");
        }
        return card;
    }

    function setBusy(value) {
        busy = value;
        const canInteract = canEdit && !busy;
        form.querySelectorAll("input, select, textarea, button").forEach(control => {
            control.disabled = !canInteract;
        });
        byId("deleteSharedCard").disabled =
            !canInteract || !firebase?.sharedCardsReady || creating;
        byId("sharedCardSearch").disabled = !canInteract;
        byId("newSharedCard").disabled = !canInteract;
        byId("importSharedCards").disabled = !canInteract || !pendingImport;
        byId("downloadCsvTemplate").disabled = !canInteract;
        byId("sharedCardImportFile").disabled = !canInteract;
        renderList();
    }

    function renderList() {
        const cards = getCards();
        const query = byId("sharedCardSearch").value.trim().toLocaleLowerCase();
        const visibleCards = cards.filter(card =>
            `${card.name} ${card.series} ${card.rarity}`.toLocaleLowerCase().includes(query)
        );
        byId("sharedCardCount").textContent = String(cards.length);
        list.innerHTML = visibleCards.length
            ? visibleCards.map(card => `
                <li>
                    <button type="button" data-card-id="${escapeHTML(card.id)}"
                        aria-current="${card.id === selectedId ? "true" : "false"}"
                        ${!canEdit || busy ? "disabled" : ""}>
                        <span><strong>${escapeHTML(card.name)}</strong><small>${escapeHTML(card.series)}</small></span>
                        <em>${escapeHTML(card.rarity)}</em>
                    </button>
                </li>`).join("")
            : `<li class="shared-card-empty">${cards.length ? "No cards match that search." : "No cards in the catalog yet."}</li>`;
    }

    function refreshImagePreview() {
        showMessage("sharedCardImageError", "");
        let source = "";
        if (pendingImageFile) {
            if (!previewObjectUrl) previewObjectUrl = URL.createObjectURL(pendingImageFile);
            source = previewObjectUrl;
        } else {
            if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
            previewObjectUrl = "";
            const value = imageInput.value.trim();
            if (value) {
                try {
                    source = normalizeImage(value);
                } catch (error) {
                    imagePreview.hidden = true;
                    imageEmpty.hidden = false;
                    showMessage("sharedCardImageError", error.message, true);
                    return;
                }
            }
        }
        if (!source) {
            imagePreview.hidden = true;
            imageEmpty.hidden = false;
            return;
        }
        imagePreview.src = source;
        imagePreview.alt = `${byId("sharedCardName").value.trim() || "Card"} image preview`;
        imagePreview.hidden = false;
        imageEmpty.hidden = true;
    }

    function updateGeneratedId() {
        byId("sharedCardId").textContent = creating
            ? makeCardId(byId("sharedCardName").value.trim(), byId("sharedCardSeries").value.trim())
            : selectedId;
    }

    function clearForm() {
        form.reset();
        imageFileInput.value = "";
        pendingImageFile = null;
        selectedCard = null;
        byId("sharedCardRarity").value = "SSR";
        selectedId = "";
        creating = true;
        dirty = false;
        byId("cardEditorHeading").textContent = "Add a shared card";
        byId("cardEditorHint").textContent =
            "The card ID is generated from the name and series. To update it later, import a card with the same ID.";
        byId("sharedCardId").textContent = "generated when saved";
        byId("saveSharedCard").textContent = "Add card to catalog";
        byId("cancelSharedCard").hidden = true;
        byId("deleteSharedCard").hidden = true;
        showMessage("sharedCardMessage", "");
        refreshImagePreview();
        renderList();
    }

    function loadCard(card) {
        creating = false;
        selectedCard = card;
        selectedId = card.id;
        dirty = false;
        imageFileInput.value = "";
        pendingImageFile = null;
        byId("sharedCardName").value = card.name;
        byId("sharedCardSeries").value = card.series;
        byId("sharedCardRarity").value = card.rarity;
        byId("sharedCardTitle").value = card.title;
        byId("sharedCardDescription").value = card.description;
        imageInput.value = card.image;
        byId("sharedCardId").textContent = card.id;
        byId("cardEditorHeading").textContent = "Edit shared card";
        byId("cardEditorHint").textContent = "Changes are published to everyone using this Firebase project.";
        byId("saveSharedCard").textContent = "Save changes";
        byId("cancelSharedCard").hidden = false;
        byId("deleteSharedCard").hidden = false;
        showMessage("sharedCardMessage", "");
        refreshImagePreview();
        renderList();
    }

    function confirmDiscard() {
        return !dirty || window.confirm("Discard your unsaved card changes?");
    }

    function parseCSV(text) {
        const rows = [];
        let row = [];
        let field = "";
        let quoted = false;
        for (let index = 0; index < text.length; index += 1) {
            const character = text[index];
            if (quoted) {
                if (character === '"' && text[index + 1] === '"') {
                    field += '"';
                    index += 1;
                } else if (character === '"') {
                    quoted = false;
                } else {
                    field += character;
                }
            } else if (character === '"' && field.length === 0) {
                quoted = true;
            } else if (character === ",") {
                row.push(field);
                field = "";
            } else if (character === "\n" || character === "\r") {
                row.push(field);
                if (row.some(value => value.trim())) rows.push(row);
                row = [];
                field = "";
                if (character === "\r" && text[index + 1] === "\n") index += 1;
            } else {
                field += character;
            }
        }
        if (quoted) throw new Error("The CSV file has an unclosed quoted field.");
        row.push(field);
        if (row.some(value => value.trim())) rows.push(row);
        if (rows.length < 2) throw new Error("The CSV needs a header row and at least one card.");

        const headers = rows[0].map(value => value.replace(/^\uFEFF/, "").trim().toLowerCase());
        const required = ["name", "series", "rarity", "title", "description"];
        const missing = required.filter(header => !headers.includes(header));
        if (missing.length) throw new Error(`CSV is missing required columns: ${missing.join(", ")}.`);
        if (new Set(headers).size !== headers.length) throw new Error("The CSV header contains duplicate columns.");
        return rows.slice(1).map((values, rowIndex) => {
            if (values.slice(headers.length).some(value => value.trim())) {
                throw new Error(`CSV row ${rowIndex + 2} has more values than the header.`);
            }
            return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
        });
    }

    function normalizeImportedCards(records) {
        if (!Array.isArray(records) || !records.length) {
            throw new Error("The file must contain at least one card.");
        }
        const usedIds = new Set(getCards().map(card => card.id));
        const importedIds = new Set();
        return records.map((record, index) => {
            if (!record || typeof record !== "object" || Array.isArray(record)) {
                throw new Error(`Card ${index + 1} must be an object.`);
            }
            const name = String(record.name ?? "").trim();
            const series = String(record.series ?? "").trim();
            const id = String(record.id ?? "").trim() ||
                makeCardId(name, series, usedIds);
            const card = {
                id,
                name,
                series,
                rarity: String(record.rarity ?? "").trim().toUpperCase(),
                title: String(record.title ?? "").trim(),
                description: String(record.description ?? "").trim(),
                image: normalizeImage(String(record.image ?? ""))
            };
            validateCard(card);
            if (importedIds.has(card.id)) {
                throw new Error(`Card ${index + 1} repeats ID "${card.id}".`);
            }
            importedIds.add(card.id);
            usedIds.add(card.id);
            return card;
        });
    }

    async function readImportFile(file) {
        if (!file) {
            pendingImport = null;
            showMessage("sharedCardImportSummary", "Choose a JSON or CSV file to import.");
            setBusy(false);
            return;
        }
        if (file.size > MAX_IMPORT_BYTES) {
            pendingImport = null;
            showMessage("sharedCardImportSummary", "Choose a file smaller than 5 MB.", true);
            setBusy(false);
            return;
        }
        try {
            setBusy(true);
            const text = await file.text();
            let records;
            if (/\.csv$/i.test(file.name)) {
                records = parseCSV(text);
            } else {
                let parsed;
                try {
                    parsed = JSON.parse(text);
                } catch (error) {
                    throw new Error("That JSON file could not be parsed.", { cause: error });
                }
                records = Array.isArray(parsed) ? parsed : parsed?.cards;
            }
            pendingImport = normalizeImportedCards(records);
            const existingIds = new Set(getCards().map(card => card.id));
            const updates = pendingImport.filter(card => existingIds.has(card.id)).length;
            const additions = pendingImport.length - updates;
            showMessage("sharedCardImportSummary",
                `${pendingImport.length} cards ready: ${additions} new, ${updates} updates. Import will save them together.`);
            showMessage("sharedCardImportMessage", "");
        } catch (error) {
            pendingImport = null;
            showMessage("sharedCardImportSummary", error.message, true);
        } finally {
            setBusy(false);
        }
    }

    async function saveCard(event) {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const name = byId("sharedCardName").value.trim();
        const series = byId("sharedCardSeries").value.trim();
        const previousCard = creating ? null : selectedCard;
        let uploadedImage = null;
        let firestoreSaved = false;
        try {
            const card = {
                id: creating ? makeCardId(name, series) : selectedId,
                name,
                series,
                rarity: byId("sharedCardRarity").value,
                title: byId("sharedCardTitle").value.trim(),
                description: byId("sharedCardDescription").value.trim(),
                image: pendingImageFile ? DEFAULT_IMAGE : normalizeImage(imageInput.value)
            };
            if (previousCard?.imagePath && card.image === previousCard.image) {
                card.imagePath = previousCard.imagePath;
            }
            validateCard(card);
            setBusy(true);
            if (pendingImageFile) {
                showMessage("sharedCardMessage", "Uploading photo...");
                uploadedImage = await firebase.uploadSharedCardImage(pendingImageFile, card.id);
                card.image = uploadedImage.url;
                card.imagePath = uploadedImage.path;
            }
            showMessage("sharedCardMessage", "Saving shared card...");
            if (creating) await firebase.addSharedCard(card, getCards());
            else await firebase.updateSharedCard(card, getCards());
            firestoreSaved = true;
            const updatedCards = new Map(getCards().map(existing => [existing.id, existing]));
            updatedCards.set(card.id, card);
            catalog = [...updatedCards.values()];
            Gacha.setSharedCharacters(catalog);
            selectedId = card.id;
            creating = false;
            dirty = false;
            loadCard(card);

            if (previousCard?.imagePath && card.imagePath !== previousCard.imagePath) {
                try {
                    await firebase.deleteSharedCardImage(previousCard.imagePath);
                } catch (error) {
                    showMessage("sharedCardMessage",
                        `${card.name} was saved, but its previous photo could not be removed: ${sharedCardErrorMessage(error)}`,
                        true);
                    return;
                }
            }
            showMessage("sharedCardMessage", `${card.name} is saved to the shared catalog.`);
        } catch (error) {
            let message = sharedCardErrorMessage(error);
            if (uploadedImage && !firestoreSaved) {
                try {
                    await firebase.deleteSharedCardImage(uploadedImage.path);
                } catch (cleanupError) {
                    message += ` The uploaded photo could not be cleaned up: ${sharedCardErrorMessage(cleanupError)}`;
                }
            }
            showMessage("sharedCardMessage", message, true);
        } finally {
            setBusy(false);
        }
    }

    async function deleteCard() {
        const card = getCards().find(item => item.id === selectedId);
        if (!card || !window.confirm(`Delete "${card.name}" from the shared catalog for everyone?`)) return;
        try {
            setBusy(true);
            await firebase.deleteSharedCard(card.id, getCards());
            catalog = getCards().filter(item => item.id !== card.id);
            Gacha.setSharedCharacters(catalog);
            if (catalog.length) loadCard(catalog[0]);
            else clearForm();
            if (card.imagePath) {
                try {
                    await firebase.deleteSharedCardImage(card.imagePath);
                } catch (error) {
                    showMessage("sharedCardStatus",
                        `${card.name} was removed, but its photo could not be deleted: ${sharedCardErrorMessage(error)}`,
                        true);
                    return;
                }
            }
            showMessage("sharedCardStatus", `${card.name} was removed from the shared catalog.`);
        } catch (error) {
            showMessage("sharedCardMessage", sharedCardErrorMessage(error), true);
        } finally {
            setBusy(false);
        }
    }

    async function importCards() {
        if (!pendingImport || !pendingImport.length) return;
        const existingCards = new Map(getCards().map(card => [card.id, card]));
        const imported = pendingImport.map(card => {
            const existing = existingCards.get(card.id);
            return existing?.imagePath && card.image === existing.image
                ? { ...card, imagePath: existing.imagePath }
                : card;
        });
        const ids = new Set(getCards().map(card => card.id));
        const updated = imported.filter(card => ids.has(card.id)).length;
        const added = imported.length - updated;
        const obsoleteImagePaths = imported
            .filter(card => existingCards.get(card.id)?.imagePath &&
                card.image !== existingCards.get(card.id).image)
            .map(card => existingCards.get(card.id).imagePath);
        try {
            setBusy(true);
            await firebase.importSharedCards(imported, getCards());
            const importedById = new Map(imported.map(card => [card.id, card]));
            const updatedCards = new Map(getCards().map(card => [card.id, card]));
            for (const [id, card] of importedById) updatedCards.set(id, card);
            catalog = [...updatedCards.values()];
            Gacha.setSharedCharacters(catalog);
            pendingImport = null;
            byId("sharedCardImportFile").value = "";
            showMessage("sharedCardImportSummary", "");
            showMessage("sharedCardImportMessage",
                `Imported ${imported.length} cards: ${added} added and ${updated} updated.`);
            loadCard(imported[0]);
            for (const path of obsoleteImagePaths) {
                try {
                    await firebase.deleteSharedCardImage(path);
                } catch (error) {
                    showMessage("sharedCardImportMessage",
                        `Cards imported, but an old photo could not be removed: ${sharedCardErrorMessage(error)}`,
                        true);
                    break;
                }
            }
        } catch (error) {
            showMessage("sharedCardImportMessage", sharedCardErrorMessage(error), true);
        } finally {
            setBusy(false);
        }
    }

    function downloadTemplate() {
        const csv = [
            "id,name,series,rarity,title,description,image",
            ',Example Character,Example Series,SR,Example Title,"A short character description.",'
        ].join("\r\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "shared-cards-template.csv";
        anchor.click();
        URL.revokeObjectURL(url);
    }

    async function init() {
        StudyArchive.init();
        Gacha.init();
        firebase = await window.FirebaseSyncReady;
        if (!firebase || !firebase.configured) {
            showMessage("sharedCardAccess",
                firebase?.getStatus?.().message || "Firebase could not start. Check the browser console.", true);
            return;
        }

        firebase.subscribeToAuth(user => {
            canEdit = firebase.isDeveloper;
            byId("sharedCardsNavLink").hidden = !canEdit;
            byId("sharedCardSettingsLink").hidden = canEdit;
            workspace.hidden = !canEdit;
            byId("sharedCardAccess").textContent = canEdit
                ? `Signed in${user?.email ? ` as ${user.email}` : ""}. Your changes are shared with every visitor.`
                : user
                    ? "This account cannot edit the shared catalog. Sign in with an authorized developer account."
                    : "Sign in on the Settings page with an authorized developer account to manage shared cards.";
            byId("sharedCardAccess").classList.toggle("error", !canEdit);
            setBusy(false);
        });

        firebase.subscribeToSharedCards(cards => {
            catalog = cards || Gacha.getSharedCharacters();
            renderList();
            showMessage("sharedCardStatus", firebase.sharedCardsReady
                ? "Shared catalog is ready."
                : "Connecting to Firebase. You can add or edit cards while the catalog loads; delete is enabled after it loads.");
            if (!creating && !dirty) {
                const current = catalog.find(card => card.id === selectedId);
                if (current) loadCard(current);
                else if (catalog.length) loadCard(catalog[0]);
                else clearForm();
            }
            if (pendingImport) {
                const existingIds = new Set(catalog.map(card => card.id));
                const updates = pendingImport.filter(card => existingIds.has(card.id)).length;
                showMessage("sharedCardImportSummary",
                    `${pendingImport.length} cards ready: ${pendingImport.length - updates} new, ${updates} updates. Import will save them together.`);
            }
            setBusy(false);
        });

        firebase.subscribeToStatus(status => {
            if (status.isError) {
                showMessage("sharedCardStatus", status.message, true);
            }
        });

        form.addEventListener("input", () => {
            dirty = true;
            updateGeneratedId();
            refreshImagePreview();
        });
        form.addEventListener("submit", saveCard);
        byId("newSharedCard").addEventListener("click", () => {
            if (!confirmDiscard()) return;
            clearForm();
            byId("sharedCardName").focus();
        });
        byId("cancelSharedCard").addEventListener("click", () => {
            if (!confirmDiscard()) return;
            const current = catalog.find(card => card.id === selectedId);
            if (current) loadCard(current);
            else clearForm();
        });
        byId("deleteSharedCard").addEventListener("click", deleteCard);
        byId("sharedCardSearch").addEventListener("input", renderList);
        imageInput.addEventListener("input", () => {
            if (!pendingImageFile) return;
            pendingImageFile = null;
            imageFileInput.value = "";
            if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
            previewObjectUrl = "";
        });
        imageFileInput.addEventListener("change", event => {
            const file = event.currentTarget.files[0];
            if (!file) {
                pendingImageFile = null;
                if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
                previewObjectUrl = "";
                refreshImagePreview();
                return;
            }
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                imageFileInput.value = "";
                pendingImageFile = null;
                refreshImagePreview();
                showMessage("sharedCardImageError", "Choose a JPEG, PNG, WebP, or GIF image.", true);
                return;
            }
            if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
                imageFileInput.value = "";
                pendingImageFile = null;
                refreshImagePreview();
                showMessage("sharedCardImageError", "Choose a non-empty image up to 5 MB.", true);
                return;
            }
            if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
            previewObjectUrl = "";
            pendingImageFile = file;
            dirty = true;
            refreshImagePreview();
            showMessage("sharedCardImageError", "Selected photo will replace the image when you save.");
        });
        list.addEventListener("click", event => {
            const button = event.target.closest("button[data-card-id]");
            if (!button || !confirmDiscard()) return;
            const card = catalog.find(item => item.id === button.dataset.cardId);
            if (card) loadCard(card);
        });
        imagePreview.addEventListener("error", () => {
            imagePreview.hidden = true;
            imageEmpty.hidden = false;
            showMessage("sharedCardImageError", "This image could not be loaded. Check the URL or path.");
        });
        byId("sharedCardImportFile").addEventListener("change", event => {
            void readImportFile(event.currentTarget.files[0]);
        });
        byId("importSharedCards").addEventListener("click", importCards);
        byId("downloadCsvTemplate").addEventListener("click", downloadTemplate);

        clearForm();
        setBusy(false);
    }

    document.addEventListener("DOMContentLoaded", () => {
        void init().catch(error => {
            showMessage("sharedCardAccess", error.message || "The shared-card editor could not start.", true);
            console.error(error);
        });
    });
}());
