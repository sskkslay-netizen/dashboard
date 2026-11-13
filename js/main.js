
/* ==========================================
   STUDY ARCHIVE
   Main Application Script
   ========================================== */

const StudyArchive = {
    STORAGE_KEY: "studyArchiveData",
    INITIAL_CRYSTALS: 1600,

    defaultData: {
        crystals: 0,
        welcomeCrystalsGranted: false,
        totalFocusMinutes: 0,
        completedMissions: [],
        assignments: [],
        calendarEvents: [],
        notes: [],
        quizSets: [],
        profile: {
            name: "Scholar",
            avatar: ""
        },
        characters: [],
        wishHistory: [],
        achievements: [],
        characterCardLevels: {},
        customCharacters: [],
        incognitoMode: false
    },

    data: {},

    init() {
        const savedData = localStorage.getItem(this.STORAGE_KEY);

        try {
            this.data = savedData
                ? { ...this.defaultData, ...JSON.parse(savedData) }
                : { ...this.defaultData };
        } catch (error) {
            console.error("Could not load saved data:", error);
            this.data = { ...this.defaultData };
        }

        // Make sure all expected collections exist.
        Object.keys(this.defaultData).forEach(key => {
            if (Array.isArray(this.defaultData[key]) &&
                !Array.isArray(this.data[key])) {
                this.data[key] = [];
            }
        });
        this.data.characterCardLevels =
            this.data.characterCardLevels &&
            typeof this.data.characterCardLevels === "object" &&
            !Array.isArray(this.data.characterCardLevels)
                ? { ...this.data.characterCardLevels }
                : {};
        if (!Array.isArray(this.data.customCharacters)) {
            this.data.customCharacters = [];
        }
        this.data.incognitoMode = this.data.incognitoMode === true;

        const savedProfile = this.data.profile &&
            typeof this.data.profile === "object" &&
            !Array.isArray(this.data.profile)
            ? this.data.profile
            : {};
        this.data.profile = {
            name: typeof savedProfile.name === "string" && savedProfile.name.trim()
                ? savedProfile.name.trim()
                : this.defaultData.profile.name,
            avatar: typeof savedProfile.avatar === "string"
                ? savedProfile.avatar
                : ""
        };

        if (typeof this.data.crystals !== "number") {
            this.data.crystals = 0;
        }

        if (typeof this.data.totalFocusMinutes !== "number") {
            this.data.totalFocusMinutes = 0;
        }

        if (this.data.welcomeCrystalsGranted !== true) {
            this.data.crystals += this.INITIAL_CRYSTALS;
            this.data.welcomeCrystalsGranted = true;
            this.save();
        } else {
            this.updateDisplay();
        }

        this.applyPrivacyMode();
        console.log("Study Archive initialized!");
    },

    save() {
        localStorage.setItem(
            this.STORAGE_KEY,
            JSON.stringify(this.data)
        );

        window.FirebaseSync?.save(this.STORAGE_KEY, this.data);
        this.updateDisplay();
        this.checkAchievements();
    },

    addCrystals(amount) {
        if (!Number.isFinite(amount) || amount <= 0) return;

        this.data.crystals += amount;
        this.save();
    },

    spendCrystals(amount) {
        if (
            !Number.isFinite(amount) ||
            amount <= 0 ||
            this.data.crystals < amount
        ) {
            return false;
        }

        this.data.crystals -= amount;
        this.save();

        return true;
    },

    updateDisplay() {
        const balance = document.getElementById("crystalBalance");
        const count = document.getElementById("crystalCount");
        const wishBalance = document.getElementById("wishCrystalBalance");
        const profileInitial = document.getElementById("profileInitial");
        const profileAvatar = document.getElementById("profileAvatarImage");
        const welcomeTitle = document.getElementById("welcomeTitle");
        const profileName = this.data.profile?.name?.trim() || "Scholar";

        if (balance) balance.textContent = this.data.crystals;
        if (count) count.textContent = this.data.crystals;
        if (wishBalance) wishBalance.textContent = this.data.crystals;
        if (profileInitial) profileInitial.textContent = profileName.charAt(0).toUpperCase();
        if (profileAvatar) {
            profileAvatar.src = this.data.profile.avatar || "";
            profileAvatar.hidden = !this.data.profile.avatar;
        }
        if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${profileName}.`;
    },

    applyPrivacyMode() {
        const personalNav = document.querySelector('.sidebar-nav[aria-label="Personal"]');
        if (personalNav && !personalNav.querySelector('[data-settings-link], a[href$="settings.html"]')) {
            const settingsLink = document.createElement("a");
            const isPageRoute = window.location.pathname.includes("/pages/");
            settingsLink.href = isPageRoute ? "settings.html" : "pages/settings.html";
            settingsLink.className = "nav-link";
            settingsLink.title = "Settings";
            settingsLink.dataset.settingsLink = "true";
            settingsLink.innerHTML = '<span class="nav-icon" aria-hidden="true">⚙</span><span class="nav-link-label">Settings</span>';
            personalNav.appendChild(settingsLink);
        }

        if (!this.data.incognitoMode) {
            document.body.classList.remove("incognito-mode");
            document.querySelectorAll("[data-incognito-hidden]").forEach(element => {
                element.hidden = false;
                element.removeAttribute("data-incognito-hidden");
            });
            document.querySelectorAll("[data-incognito-section-hidden]").forEach(element => {
                element.hidden = false;
                element.removeAttribute("data-incognito-section-hidden");
            });
            document.querySelectorAll("[data-incognito-content]").forEach(element => {
                element.hidden = false;
                element.removeAttribute("data-incognito-content");
            });
            document.querySelectorAll(".incognito-notice").forEach(element => element.remove());
            return;
        }

        document.body.classList.add("incognito-mode");
        document.querySelectorAll("a[href]").forEach(link => {
            let pathname;
            try {
                pathname = new URL(link.href, window.location.href).pathname;
            } catch (error) {
                return;
            }
            if (/\/pages\/(wish|characters|history)\.html$/.test(pathname)) {
                link.hidden = true;
                link.dataset.incognitoHidden = "true";
                const section = link.closest(".sidebar-section");
                if (section && !section.querySelector("a:not([hidden])")) {
                    section.hidden = true;
                    section.dataset.incognitoSectionHidden = "true";
                }
                const card = link.closest(".quick-access-card");
                if (card) card.hidden = true;
            }
        });

        const privateContent = document.querySelector(".wish-content, .collection-content");
        if (privateContent) {
            privateContent.hidden = true;
            privateContent.dataset.incognitoContent = "true";
            document.getElementById("wishResultOverlay")?.setAttribute("hidden", "");
            const notice = document.createElement("section");
            notice.className = "incognito-notice";
            notice.setAttribute("role", "status");
            notice.innerHTML = `
                <span class="incognito-mark" aria-hidden="true">◌</span>
                <p class="page-eyebrow">INCOGNITO MODE</p>
                <h1>Character pages are hidden.</h1>
                <p>Wish pulling, characters, and wish history are hidden on this device. Your study tools and crystal rewards still work.</p>
                <a class="collection-wish-link" href="${window.location.pathname.includes("/pages/act/") ? "../../pages/settings.html" : "settings.html"}">Open Settings</a>`;
            const topbar = document.querySelector(".main-content > .topbar");
            if (topbar) topbar.insertAdjacentElement("afterend", notice);
        }
    },

    setIncognitoMode(enabled) {
        if (typeof enabled !== "boolean") {
            throw new Error("Choose whether Incognito mode should be on or off.");
        }
        const previousValue = this.data.incognitoMode;
        this.data.incognitoMode = enabled;
        try {
            this.save();
        } catch (error) {
            this.data.incognitoMode = previousValue;
            throw error;
        }
        this.applyPrivacyMode();
    },

    imageToDataURL(file) {
        if (!file || !file.type.startsWith("image/")) {
            return Promise.reject(new Error("Choose an image file."));
        }
        if (file.size > 8 * 1024 * 1024) {
            return Promise.reject(new Error("Choose an image smaller than 8 MB."));
        }

        return createImageBitmap(file).then(bitmap => {
            const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(bitmap.width * scale));
            canvas.height = Math.max(1, Math.round(bitmap.height * scale));

            const context = canvas.getContext("2d");
            if (!context) {
                bitmap.close();
                throw new Error("Your browser could not process this image.");
            }

            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            bitmap.close();

            for (const quality of [0.8, 0.68, 0.56, 0.44]) {
                const image = canvas.toDataURL("image/jpeg", quality);
                if (image.length <= 1_200_000) return image;
            }

            throw new Error("This image is too large to save. Choose a smaller image.");
        }).catch(error => {
            if (error instanceof Error && error.message) throw error;
            throw new Error("This image could not be opened.");
        });
    },

    completeMission(missionId, reward = 10) {
        if (this.data.completedMissions.includes(missionId)) {
            return false;
        }

        this.data.completedMissions.push(missionId);
        this.addCrystals(reward);

        return true;
    },

    addFocusTime(minutes) {
        if (!Number.isFinite(minutes) || minutes <= 0) return;

        this.data.totalFocusMinutes += minutes;
        this.save();
    },

    // Check achievement conditions without awarding duplicates.
    checkAchievements() {
        if (!window.Achievements || !Array.isArray(this.data.achievements)) {
            return;
        }

        Achievements.checkAchievements();
    },

    resetData() {
        this.data = JSON.parse(JSON.stringify(this.defaultData));
        this.data.welcomeCrystalsGranted = true;
        this.save();
    }
};

window.FirebaseSyncReady = import("./firebase-sync.js").catch(error => {
    console.error("Firebase sync could not start:", error);
    return null;
});

// Start the application.
document.addEventListener("DOMContentLoaded", () => {
    StudyArchive.init();
});

// Make the system accessible to other page scripts.
window.StudyArchive = StudyArchive;
