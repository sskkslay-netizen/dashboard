const Files = {
    firebase: null,
    user: null,
    files: [],
    loadToken: 0,

    async init() {
        document.getElementById("fileUploadForm")
            .addEventListener("submit", event => {
                event.preventDefault();
                void this.uploadFile();
            });
        document.getElementById("filesList")
            .addEventListener("click", event => {
                const downloadButton = event.target.closest("[data-download-file]");
                const deleteButton = event.target.closest("[data-delete-file]");
                if (downloadButton) void this.downloadFile(downloadButton.dataset.downloadFile);
                if (deleteButton) void this.deleteFile(deleteButton.dataset.deleteFile);
            });

        try {
            this.firebase = await window.FirebaseSyncReady;
        } catch (error) {
            this.setAccessMessage(error.message || "Account storage could not be started.", true);
            return;
        }

        if (!this.firebase?.configured) {
            this.setAccessMessage("Firebase is not configured. Add your project settings to enable private file storage.", true);
            return;
        }

        this.firebase.subscribeToAuth(user => {
            this.user = user;
            this.loadToken += 1;
            this.files = [];
            this.renderFiles();
            this.updateAccess();
            if (user) void this.loadFiles();
        });
    },

    updateAccess() {
        const signedIn = Boolean(this.user);
        document.getElementById("fileInput").disabled = !signedIn;
        document.getElementById("uploadFileButton").disabled = !signedIn;
        document.getElementById("filesAccessMessage").textContent = signedIn
            ? `Signed in${this.user.email ? ` as ${this.user.email}` : ""}. Your files are private to this account.`
            : "Sign in through Settings to use your private file library.";
        document.getElementById("filesAccessMessage").classList.toggle("error", !signedIn);
        if (!signedIn) {
            const empty = document.createElement("p");
            empty.className = "files-empty-state";
            empty.textContent = "Sign in to see files saved to your account.";
            document.getElementById("filesList").replaceChildren(empty);
            this.setFilesMessage("");
        }
    },

    async loadFiles() {
        const requestToken = ++this.loadToken;
        const uid = this.user?.uid;
        if (!uid) return;
        this.setFilesMessage("Loading your files…");
        try {
            const files = await this.firebase.listUserFiles();
            if (requestToken !== this.loadToken || uid !== this.user?.uid) return;
            this.files = files;
            this.renderFiles();
            this.setFilesMessage("");
        } catch (error) {
            if (requestToken !== this.loadToken || uid !== this.user?.uid) return;
            this.setFilesMessage(error.message || "Your files could not be loaded.", true);
        }
    },

    async uploadFile() {
        const input = document.getElementById("fileInput");
        const file = input.files[0];
        if (!file) {
            this.setFilesMessage("Choose a file to upload.", true);
            return;
        }

        const button = document.getElementById("uploadFileButton");
        button.disabled = true;
        this.setFilesMessage("Uploading your file…");
        try {
            await this.firebase.uploadUserFile(file);
            input.value = "";
            this.setFilesMessage("File uploaded.");
            await this.loadFiles();
        } catch (error) {
            this.setFilesMessage(error.message || "Your file could not be uploaded.", true);
        } finally {
            button.disabled = !this.user;
        }
    },

    async downloadFile(path) {
        try {
            const { blob, name } = await this.firebase.downloadUserFile(path);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            this.setFilesMessage(error.message || "The file could not be downloaded.", true);
        }
    },

    async deleteFile(path) {
        const file = this.files.find(item => item.path === path);
        if (!file || !confirm(`Delete "${file.name}" from your private library?`)) return;
        try {
            await this.firebase.deleteUserFile(path);
            this.setFilesMessage("File deleted.");
            await this.loadFiles();
        } catch (error) {
            this.setFilesMessage(error.message || "The file could not be deleted.", true);
        }
    },

    renderFiles() {
        const container = document.getElementById("filesList");
        const count = document.getElementById("filesCount");
        count.textContent = `${this.files.length} ${this.files.length === 1 ? "file" : "files"}`;
        container.replaceChildren();

        if (!this.files.length) {
            const empty = document.createElement("p");
            empty.className = "files-empty-state";
            empty.textContent = this.user
                ? "No files yet. Add a document or image to get started."
                : "Sign in to see files saved to your account.";
            container.appendChild(empty);
            return;
        }

        this.files.forEach(file => {
            const item = document.createElement("article");
            item.className = "file-item";
            const icon = document.createElement("span");
            icon.className = "file-item-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = file.type.startsWith("image/") ? "▧" : "▤";
            const details = document.createElement("div");
            details.className = "file-item-details";
            const name = document.createElement("strong");
            name.textContent = file.name;
            const metadata = document.createElement("small");
            metadata.textContent = `${this.formatSize(file.size)} · ${this.formatDate(file.uploadedAt)}`;
            details.append(name, metadata);
            const actions = document.createElement("div");
            actions.className = "file-item-actions";
            actions.append(
                this.makeButton("Download", "file-action-button", { "data-download-file": file.path }),
                this.makeButton("Delete", "file-action-button delete", { "data-delete-file": file.path })
            );
            item.append(icon, details, actions);
            container.appendChild(item);
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
    },

    formatSize(size) {
        if (!Number.isFinite(size) || size < 0) return "Unknown size";
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    },

    formatDate(value) {
        const date = new Date(value);
        return Number.isFinite(date.getTime())
            ? date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
            : "Date unavailable";
    },

    setAccessMessage(message, isError = false) {
        const element = document.getElementById("filesAccessMessage");
        element.textContent = message;
        element.classList.toggle("error", isError);
    },

    setFilesMessage(message, isError = false) {
        const element = document.getElementById("filesMessage");
        element.textContent = message;
        element.classList.toggle("error", isError);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    void Files.init();
});
