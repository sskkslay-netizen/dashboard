
/* ==========================================
   STUDY ARCHIVE — NOTES SYSTEM
   ========================================== */

const Notes = {
    selectedSubject: "all",
    selectedFilter: null,
    selectedTag: "all",
    searchQuery: "",
    sortMode: "newest",

    init() {
        if (!window.StudyArchive) {
            console.error("StudyArchive could not be loaded.");
            return;
        }

        const data = StudyArchive.data;

        if (!Array.isArray(data.notes)) data.notes = [];
        if (!Array.isArray(data.noteFolders)) {
            data.noteFolders = ["Biology", "History", "Math", "French", "Other"];
        }

        const requestedSubject = new URLSearchParams(window.location.search)
            .get("subject")
            ?.toLowerCase();
        const subjectAliases = {
            mathematics: "math",
            languages: "french"
        };
        const subjectToSelect = subjectAliases[requestedSubject] || requestedSubject;
        const matchingFolder = data.noteFolders.find(folder =>
            folder.toLowerCase() === subjectToSelect
        );

        if (matchingFolder) {
            this.selectedSubject = matchingFolder;
        }

        this.bindEvents();
        this.renderFolders();
        this.render();
    },

    bindEvents() {
        document.getElementById("newNoteButton")
            .addEventListener("click", () => this.openModal());

        document.getElementById("emptyNewNoteButton")
            .addEventListener("click", () => this.openModal());

        document.getElementById("closeNoteModal")
            .addEventListener("click", () => this.closeModal());

        document.getElementById("cancelNoteButton")
            .addEventListener("click", () => this.closeModal());

        document.getElementById("noteForm")
            .addEventListener("submit", event => {
                event.preventDefault();
                this.saveNote();
            });

        document.getElementById("deleteNoteButton")
            .addEventListener("click", () => this.deleteNote());

        document.getElementById("noteImage")
            .addEventListener("change", event => {
                const file = event.target.files[0];
                const removeButton = document.getElementById("removeNoteImage");
                event.target.dataset.removeImage = "false";

                if (!file) return;
                this.setImagePreview(URL.createObjectURL(file));
                removeButton.hidden = false;
            });

        document.getElementById("removeNoteImage")
            .addEventListener("click", () => {
                const input = document.getElementById("noteImage");
                input.value = "";
                input.dataset.removeImage = "true";
                this.setImagePreview("");
                document.getElementById("removeNoteImage").hidden = true;
            });

        document.getElementById("notesSearch")
            .addEventListener("input", event => {
                this.searchQuery = event.target.value.toLowerCase();
                this.render();
            });

        document.getElementById("notesSort")
            .addEventListener("change", event => {
                this.sortMode = event.target.value;
                this.render();
            });

        document.getElementById("addFolderButton")
            .addEventListener("click", () => this.addFolder());

        document.getElementById("folderList")
            .addEventListener("click", event => {
                const button = event.target.closest("[data-subject]");
                if (!button) return;

                this.selectedSubject = button.dataset.subject;
                this.selectedFilter = null;
                this.renderFolders();
                this.render();
            });

        document.querySelectorAll("[data-filter]").forEach(button => {
            button.addEventListener("click", () => {
                this.selectedFilter = button.dataset.filter;
                this.selectedSubject = "all";
                this.renderFolders();
                this.render();
            });
        });

        document.querySelectorAll("[data-tag]").forEach(button => {
            button.addEventListener("click", () => {
                this.selectedTag = button.dataset.tag;

                document.querySelectorAll("[data-tag]").forEach(item => {
                    item.classList.toggle("active", item === button);
                });

                this.render();
            });
        });

        document.getElementById("notesGrid")
            .addEventListener("click", event => {
                const card = event.target.closest("[data-note-id]");
                if (card) this.openModal(card.dataset.noteId);
            });

        document.getElementById("pinnedNotes")
            .addEventListener("click", event => {
                const card = event.target.closest("[data-note-id]");
                if (card) this.openModal(card.dataset.noteId);
            });

        document.getElementById("noteModal")
            .addEventListener("click", event => {
                if (event.target.id === "noteModal") this.closeModal();
            });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") this.closeModal();
        });
    },

    saveData() {
        StudyArchive.save();
    },

    dateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    },

    addFolder() {
        const name = prompt("What would you like to name your folder?");
        if (!name || !name.trim()) return;

        const cleanName = name.trim();

        if (StudyArchive.data.noteFolders.some(
            folder => folder.toLowerCase() === cleanName.toLowerCase()
        )) {
            alert("That folder already exists.");
            return;
        }

        StudyArchive.data.noteFolders.push(cleanName);
        this.saveData();
        this.renderFolders();

        this.selectedSubject = cleanName;
        this.render();
    },

    renderFolders() {
        const container = document.getElementById("folderList");
        const folders = StudyArchive.data.noteFolders;
        const notes = StudyArchive.data.notes;

        const allButton = container.querySelector('[data-subject="all"]');
        const allCount = allButton.querySelector(".folder-count");
        allCount.textContent = notes.length;

        container.querySelectorAll("[data-subject]:not([data-subject='all'])")
            .forEach(button => button.remove());

        folders.forEach(subject => {
            const count = notes.filter(note => note.subject === subject).length;
            const button = document.createElement("button");
            const folderIcons = {
                biology: "flower-2",
                history: "landmark",
                math: "sigma",
                french: "languages"
            };
            const icon = folderIcons[subject.toLowerCase()] || "folder";

            button.className = "folder-button";
            button.dataset.subject = subject;

            if (this.selectedSubject === subject) {
                button.classList.add("active");
            }

            button.innerHTML = `
                <i data-lucide="${icon}" aria-hidden="true"></i>
                <span></span>
                <span class="folder-count">${count}</span>
            `;

            button.children[1].textContent = subject;
            container.appendChild(button);
        });

        window.lucide?.createIcons();

        allButton.classList.toggle(
            "active",
            this.selectedSubject === "all" && !this.selectedFilter
        );

        container.querySelectorAll("[data-filter]").forEach(button => {
            button.classList.toggle(
                "active",
                this.selectedFilter === button.dataset.filter
            );
        });
    },

    getFilteredNotes() {
        let notes = [...StudyArchive.data.notes];

        if (this.selectedSubject !== "all") {
            notes = notes.filter(
                note => note.subject === this.selectedSubject
            );
        }

        if (this.selectedFilter === "pinned") {
            notes = notes.filter(note => note.pinned);
        }

        if (this.selectedFilter === "recent") {
            notes = notes.filter(note => {
                const edited = new Date(note.updatedAt || note.createdAt);
                return Date.now() - edited.getTime() < 7 * 86400000;
            });
        }

        if (this.selectedTag !== "all") {
            notes = notes.filter(note => note.tag === this.selectedTag);
        }

        if (this.searchQuery) {
            notes = notes.filter(note =>
                (note.title || "").toLowerCase().includes(this.searchQuery) ||
                (note.content || "").toLowerCase().includes(this.searchQuery) ||
                (note.subject || "").toLowerCase().includes(this.searchQuery)
            );
        }

        notes.sort((a, b) => {
            if (this.sortMode === "alphabetical") {
                return a.title.localeCompare(b.title);
            }

            const aDate = new Date(
                this.sortMode === "oldest"
                    ? a.createdAt
                    : a.updatedAt || a.createdAt
            );

            const bDate = new Date(
                this.sortMode === "oldest"
                    ? b.createdAt
                    : b.updatedAt || b.createdAt
            );

            return this.sortMode === "oldest"
                ? aDate - bDate
                : bDate - aDate;
        });

        return notes;
    },

    render() {
        const notes = this.getFilteredNotes();

        const pinned = notes.filter(note => note.pinned);
        const regular = notes.filter(note => !note.pinned);

        const pinnedSection = document.getElementById("pinnedSection");
        const pinnedContainer = document.getElementById("pinnedNotes");
        const grid = document.getElementById("notesGrid");

        const showPinned = !this.selectedFilter &&
            this.selectedTag === "all" &&
            !this.searchQuery &&
            this.selectedSubject === "all";

        pinnedSection.hidden = !showPinned || pinned.length === 0;

        pinnedContainer.innerHTML = pinned
            .map(note => this.createCard(note))
            .join("");

        grid.innerHTML = regular.length
            ? regular.map(note => this.createCard(note)).join("")
            : `
                <div class="notes-empty-state">
                    <i data-lucide="book-open" aria-hidden="true"></i>
                    <h3>No notes found</h3>
                    <p>Try changing your filters or create a new note.</p>
                    <button class="notes-primary-button" onclick="Notes.openModal()">
                        Create a note
                    </button>
                </div>
            `;

        document.getElementById("allNotesCount").textContent =
            StudyArchive.data.notes.length;

        document.getElementById("notesTotal").textContent =
            `${notes.length} ${notes.length === 1 ? "note" : "notes"}`;

        const title = this.selectedFilter === "pinned"
            ? "Pinned notes"
            : this.selectedFilter === "recent"
                ? "Recently edited"
                : this.selectedSubject === "all"
                    ? "All notes"
                    : this.selectedSubject;

        document.getElementById("notesSectionTitle").textContent = title;

        this.renderFolders();
        window.lucide?.createIcons();
    },

    createCard(note) {
        const preview = (note.content || "")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, " ");

        const safeTitle = this.escapeHTML(note.title);
        const safeSubject = this.escapeHTML(note.subject);
        const safeTag = this.escapeHTML(note.tag);

        const date = new Date(note.updatedAt || note.createdAt);

        return `
            <article class="note-card"
                data-note-id="${this.escapeHTML(note.id)}"
                data-subject="${safeSubject}">

                <div class="note-card-top">
                    <span class="note-subject-label">${safeSubject}</span>
                    ${note.pinned ? '<span class="note-pin"><i data-lucide="pin" aria-hidden="true"></i></span>' : ""}
                </div>

                <h3>${safeTitle}</h3>

                ${note.image ? `<img class="note-card-image" src="${this.escapeHTML(note.image)}" alt="">` : ""}
                <p class="note-preview">${this.escapeHTML(preview)}</p>

                <div class="note-card-footer">
                    <span class="note-tag">${safeTag}</span>
                    <span class="note-date">
                        ${isNaN(date) ? "" : date.toLocaleDateString()}
                    </span>
                </div>
            </article>
        `;
    },

    openModal(id = null) {
        const modal = document.getElementById("noteModal");
        const form = document.getElementById("noteForm");

        form.reset();

        const imageInput = document.getElementById("noteImage");
        imageInput.dataset.removeImage = "false";
        const noteImage = id
            ? StudyArchive.data.notes.find(item => item.id === id)?.image || ""
            : "";
        this.setImagePreview(noteImage);
        document.getElementById("removeNoteImage").hidden = !noteImage;
        const message = document.getElementById("noteFormMessage");
        message.textContent = "";
        message.classList.remove("error");

        const note = id
            ? StudyArchive.data.notes.find(item => item.id === id)
            : null;

        document.getElementById("noteId").value = note ? note.id : "";
        document.getElementById("noteTitle").value = note ? note.title : "";
        document.getElementById("noteContent").value = note ? note.content : "";
        document.getElementById("noteSubject").value =
            note ? note.subject : this.selectedSubject !== "all"
                ? this.selectedSubject
                : "Biology";

        document.getElementById("noteTag").value =
            note ? note.tag : "Study Guide";

        document.getElementById("notePinned").checked =
            note ? !!note.pinned : false;

        document.getElementById("noteModalTitle").textContent =
            note ? "Edit note" : "Create a note";

        document.getElementById("deleteNoteButton").hidden = !note;

        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");

        document.getElementById("noteTitle").focus();
    },

    closeModal() {
        const modal = document.getElementById("noteModal");
        if (!modal) return;

        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        this.setImagePreview("");
    },

    setImagePreview(source) {
        const preview = document.getElementById("noteImagePreview");
        if (preview.src.startsWith("blob:")) {
            URL.revokeObjectURL(preview.src);
        }
        preview.src = source;
        preview.hidden = !source;
    },

    async saveNote() {
        const id = document.getElementById("noteId").value;
        const title = document.getElementById("noteTitle").value.trim();
        const content = document.getElementById("noteContent").value.trim();

        if (!title || !content) return;

        const message = document.getElementById("noteFormMessage");
        message.textContent = "";
        message.classList.remove("error");

        const imageInput = document.getElementById("noteImage");
        const existing = id
            ? StudyArchive.data.notes.find(note => note.id === id)
            : null;
        let image = imageInput.dataset.removeImage === "true"
            ? ""
            : existing?.image || "";

        try {
            if (imageInput.files[0]) {
                image = await StudyArchive.imageToDataURL(imageInput.files[0]);
            }
        } catch (error) {
            message.textContent = error.message || "The photo could not be added.";
            message.classList.add("error");
            return;
        }

        const now = new Date().toISOString();
        const note = {
            id: id || `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title,
            content,
            image,
            subject: document.getElementById("noteSubject").value,
            tag: document.getElementById("noteTag").value,
            pinned: document.getElementById("notePinned").checked,
            createdAt: existing ? existing.createdAt : now,
            updatedAt: now
        };
        const previousNotes = StudyArchive.data.notes.map(item => ({ ...item }));
        const previousFolders = [...StudyArchive.data.noteFolders];
        const previousCrystals = StudyArchive.data.crystals;
        const previousMissions = [...StudyArchive.data.completedMissions];

        if (existing) {
            Object.assign(existing, note);
        } else {
            StudyArchive.data.notes.push(note);
        }

        if (!StudyArchive.data.noteFolders.includes(note.subject)) {
            StudyArchive.data.noteFolders.push(note.subject);
        }

        let earnedDailyReward = false;
        try {
            if (!existing) {
                earnedDailyReward = StudyArchive.completeMission(
                    `${this.dateKey(new Date())}:note`,
                    15
                );
            }

            if (!earnedDailyReward) this.saveData();
        } catch (error) {
            StudyArchive.data.notes = previousNotes;
            StudyArchive.data.noteFolders = previousFolders;
            StudyArchive.data.crystals = previousCrystals;
            StudyArchive.data.completedMissions = previousMissions;
            message.textContent = error.message || "The note could not be saved.";
            message.classList.add("error");
            return;
        }

        if (earnedDailyReward) {
            document.getElementById("noteRewardMessage").textContent =
                "You earned 15 crystals for today's new note!";
        }

        this.closeModal();
        this.render();
    },

    deleteNote() {
        const id = document.getElementById("noteId").value;
        if (!id) return;

        if (!confirm("Delete this note? This cannot be undone.")) return;

        StudyArchive.data.notes =
            StudyArchive.data.notes.filter(note => note.id !== id);

        this.saveData();
        this.closeModal();
        this.render();
    },

    escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }
};

window.Notes = Notes;

document.addEventListener("DOMContentLoaded", () => {
    Notes.init();
    console.log("Study Archive Notes initialized!");
});
