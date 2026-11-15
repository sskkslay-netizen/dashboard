const Journal = {
    searchQuery: "",

    init() {
        if (!Array.isArray(StudyArchive.data.journalEntries)) {
            StudyArchive.data.journalEntries = [];
        }

        this.bindEvents();
        this.resetForm();
        this.render();
    },

    bindEvents() {
        document.getElementById("entryForm").addEventListener("submit", event => {
            event.preventDefault();
            this.saveEntry();
        });
        document.getElementById("newEntryButton")
            .addEventListener("click", () => this.resetForm(true));
        document.getElementById("cancelEntryButton")
            .addEventListener("click", () => this.resetForm());
        document.getElementById("entrySearch")
            .addEventListener("input", event => {
                this.searchQuery = event.target.value.trim().toLowerCase();
                this.render();
            });
        document.getElementById("journalEntries")
            .addEventListener("click", event => {
                const editButton = event.target.closest("[data-edit-entry]");
                const deleteButton = event.target.closest("[data-delete-entry]");
                if (editButton) this.editEntry(editButton.dataset.editEntry);
                if (deleteButton) this.deleteEntry(deleteButton.dataset.deleteEntry);
            });
    },

    todayKey() {
        const today = new Date();
        return [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")
        ].join("-");
    },

    resetForm(focus = false) {
        document.getElementById("entryForm").reset();
        document.getElementById("entryId").value = "";
        document.getElementById("entryDate").value = this.todayKey();
        document.getElementById("entryFormTitle").textContent = "A new entry";
        document.getElementById("cancelEntryButton").hidden = true;
        this.setMessage("");
        if (focus) {
            document.getElementById("entryTitle").focus();
            document.getElementById("entryForm").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    },

    setMessage(message, isError = false) {
        const element = document.getElementById("journalMessage");
        element.textContent = message;
        element.classList.toggle("error", isError);
    },

    saveEntry() {
        const id = document.getElementById("entryId").value;
        const title = document.getElementById("entryTitle").value.trim();
        const content = document.getElementById("entryContent").value.trim();
        const date = document.getElementById("entryDate").value;
        if (!title || !content || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            this.setMessage("Add a title, date, and entry before saving.", true);
            return;
        }

        const previousEntries = StudyArchive.data.journalEntries;
        const existing = previousEntries.find(entry => entry.id === id);
        const now = new Date().toISOString();
        const entry = {
            id: existing?.id || `journal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title,
            content,
            date,
            createdAt: existing?.createdAt || now,
            updatedAt: now
        };
        StudyArchive.data.journalEntries = existing
            ? previousEntries.map(item => item.id === id ? entry : item)
            : [entry, ...previousEntries];

        try {
            StudyArchive.save();
        } catch (error) {
            StudyArchive.data.journalEntries = previousEntries;
            this.setMessage(error.message || "Your entry could not be saved.", true);
            return;
        }

        this.resetForm();
        this.setMessage("Your entry is saved.");
        this.render();
    },

    editEntry(id) {
        const entry = StudyArchive.data.journalEntries.find(item => item.id === id);
        if (!entry) return;

        document.getElementById("entryId").value = entry.id;
        document.getElementById("entryTitle").value = entry.title;
        document.getElementById("entryDate").value = entry.date;
        document.getElementById("entryContent").value = entry.content;
        document.getElementById("entryFormTitle").textContent = "Edit entry";
        document.getElementById("cancelEntryButton").hidden = false;
        this.setMessage("");
        document.getElementById("entryTitle").focus();
        document.getElementById("entryForm").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    },

    deleteEntry(id) {
        const entry = StudyArchive.data.journalEntries.find(item => item.id === id);
        if (!entry || !confirm(`Delete "${entry.title}"? This cannot be undone.`)) return;

        const previousEntries = StudyArchive.data.journalEntries;
        StudyArchive.data.journalEntries = previousEntries.filter(item => item.id !== id);
        try {
            StudyArchive.save();
        } catch (error) {
            StudyArchive.data.journalEntries = previousEntries;
            this.setMessage(error.message || "Your entry could not be deleted.", true);
            return;
        }

        if (document.getElementById("entryId").value === id) this.resetForm();
        this.setMessage("Entry deleted.");
        this.render();
    },

    render() {
        const list = document.getElementById("journalEntries");
        const entries = StudyArchive.data.journalEntries
            .filter(entry =>
                !this.searchQuery ||
                `${entry.title} ${entry.content}`.toLowerCase().includes(this.searchQuery)
            )
            .sort((a, b) =>
                (b.date || "").localeCompare(a.date || "") ||
                (b.updatedAt || "").localeCompare(a.updatedAt || "")
            );
        document.getElementById("entryCount").textContent =
            `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;
        list.replaceChildren();

        if (!entries.length) {
            const empty = document.createElement("p");
            empty.className = "journal-empty-state";
            empty.textContent = this.searchQuery
                ? "No entries match your search."
                : "Your diary is ready when you are.";
            list.appendChild(empty);
            return;
        }

        entries.forEach(entry => {
            const card = document.createElement("article");
            card.className = "journal-entry";
            const header = document.createElement("div");
            header.className = "journal-entry-header";
            const titleGroup = document.createElement("div");
            const title = document.createElement("h3");
            title.textContent = entry.title;
            const date = document.createElement("time");
            date.dateTime = entry.date;
            const parsedDate = new Date(`${entry.date}T00:00:00`);
            date.textContent = Number.isFinite(parsedDate.getTime())
                ? parsedDate.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                })
                : "Date not set";
            titleGroup.append(title, date);
            const actions = document.createElement("div");
            actions.className = "journal-entry-actions";
            actions.append(
                this.makeButton("Edit", "journal-edit-button", { "data-edit-entry": entry.id }),
                this.makeButton("Delete", "journal-delete-button", { "data-delete-entry": entry.id })
            );
            header.append(titleGroup, actions);
            const content = document.createElement("p");
            content.className = "journal-entry-content";
            content.textContent = entry.content;
            card.append(header, content);
            list.appendChild(card);
        });
    },

    makeButton(label, className, attributes) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = className;
        button.textContent = label;
        Object.entries(attributes).forEach(([name, value]) => {
            button.setAttribute(name, value);
        });
        return button;
    }
};

document.addEventListener("DOMContentLoaded", () => Journal.init());
