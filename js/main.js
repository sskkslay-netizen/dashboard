
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
        characterCardLevels: {}
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

        console.log("Study Archive initialized!");
    },

    save() {
        localStorage.setItem(
            this.STORAGE_KEY,
            JSON.stringify(this.data)
        );

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

// Start the application.
document.addEventListener("DOMContentLoaded", () => {
    StudyArchive.init();
});

// Make the system accessible to other page scripts.
window.StudyArchive = StudyArchive;
