
/* ==========================================
   STUDY ARCHIVE
   Main Application Script
   ========================================== */

const StudyArchive = {
    STORAGE_KEY: "studyArchiveData",

    defaultData: {
        crystals: 0,
        totalFocusMinutes: 0,
        completedMissions: [],
        assignments: [],
        calendarEvents: [],
        notes: [],
        quizSets: [],
        characters: [],
        wishHistory: [],
        achievements: []
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

        if (typeof this.data.crystals !== "number") {
            this.data.crystals = 0;
        }

        if (typeof this.data.totalFocusMinutes !== "number") {
            this.data.totalFocusMinutes = 0;
        }

        this.updateDisplay();
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

        if (balance) balance.textContent = this.data.crystals;
        if (count) count.textContent = this.data.crystals;
        if (wishBalance) wishBalance.textContent = this.data.crystals;
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
        this.save();
    }
};

// Start the application.
document.addEventListener("DOMContentLoaded", () => {
    StudyArchive.init();
});

// Make the system accessible to other page scripts.
window.StudyArchive = StudyArchive;
