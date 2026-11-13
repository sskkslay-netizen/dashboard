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

    function init() {
        StudyArchive.init();
        Gacha.init();
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
