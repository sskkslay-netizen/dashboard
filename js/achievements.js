
/* ==========================================
   ACHIEVEMENT SYSTEM
   ========================================== */

const Achievements = {
    checking: false,

    list: [
        {
            id: "first_assignment",
            title: "First Steps",
            description: "Complete your very first assignment.",
            icon: "book-open-check",
            reward: 20,
            condition: () => StudyArchive.data.assignments.some(a => a.status === "completed")
        },
        {
            id: "five_assignments",
            title: "Getting Things Done",
            description: "Complete five assignments.",
            icon: "list-checks",
            reward: 40,
            condition: () => StudyArchive.data.assignments.filter(a => a.status === "completed").length >= 5
        },
        {
            id: "ten_assignments",
            title: "Academic Weapon",
            description: "Complete ten assignments.",
            icon: "graduation-cap",
            reward: 75,
            condition: () => StudyArchive.data.assignments.filter(a => a.status === "completed").length >= 10
        },
        {
            id: "first_focus",
            title: "Finding Your Focus",
            description: "Complete your first focus session.",
            icon: "timer",
            reward: 20,
            condition: () => StudyArchive.data.totalFocusMinutes >= 25
        },
        {
            id: "focus_hour",
            title: "In The Zone",
            description: "Reach 60 total focus minutes.",
            icon: "clock-3",
            reward: 40,
            condition: () => StudyArchive.data.totalFocusMinutes >= 60
        },
        {
            id: "focus_five_hours",
            title: "Deep Work",
            description: "Reach five hours of focus time.",
            icon: "target",
            reward: 100,
            condition: () => StudyArchive.data.totalFocusMinutes >= 300
        },
        {
            id: "first_note",
            title: "Little Archivist",
            description: "Create your first study note.",
            icon: "notebook-pen",
            reward: 20,
            condition: () => StudyArchive.data.notes.length >= 1
        },
        {
            id: "five_notes",
            title: "Knowledge Keeper",
            description: "Create five study notes.",
            icon: "book-open",
            reward: 40,
            condition: () => StudyArchive.data.notes.length >= 5
        },
        {
            id: "first_wish",
            title: "Written in the Stars",
            description: "Make your first character wish.",
            icon: "star",
            reward: 20,
            condition: () => (window.Gacha?.getTotalPulls?.() || 0) >= 1
        },
        {
            id: "ten_wishes",
            title: "Starlight Collector",
            description: "Make ten character wishes.",
            icon: "star",
            reward: 50,
            condition: () => (window.Gacha?.getTotalPulls?.() || 0) >= 10
        },
        {
            id: "first_character",
            title: "New Companion",
            description: "Discover your first character.",
            icon: "gem",
            reward: 25,
            condition: () => (window.Gacha?.getCollection?.() || []).length >= 1
        },
        {
            id: "five_characters",
            title: "Growing Collection",
            description: "Discover five different characters.",
            icon: "trophy",
            reward: 100,
            condition: () => (window.Gacha?.getCollection?.() || []).length >= 5
        }
    ],

    init() {
        if (!Array.isArray(StudyArchive.data.achievements)) {
            StudyArchive.data.achievements = [];
        }

        this.checkAchievements();
        this.render();
    },

    checkAchievements() {
        if (this.checking) return;

        this.checking = true;
        let changed = false;

        try {
            this.list.forEach(achievement => {
                const alreadyUnlocked =
                    StudyArchive.data.achievements.includes(achievement.id);

                if (alreadyUnlocked) return;

                if (achievement.condition()) {
                    StudyArchive.data.achievements.push(achievement.id);

                    // Award crystals without triggering another save cycle.
                    StudyArchive.data.crystals += achievement.reward;

                    changed = true;

                    console.log(
                        `Achievement unlocked: ${achievement.title}`
                    );
                }
            });

            // Save achievement changes directly, avoiding a recursive save.
            if (changed) {
                localStorage.setItem(
                    StudyArchive.STORAGE_KEY,
                    JSON.stringify(StudyArchive.data)
                );
                window.FirebaseSync?.save(StudyArchive.STORAGE_KEY, StudyArchive.data);

                StudyArchive.updateDisplay();
            }

            this.render();

        } catch (error) {
            console.error("Achievement check failed:", error);
        } finally {
            this.checking = false;
        }
    },

    render() {
        const grid = document.getElementById("achievementGrid");
        if (!grid) return;

        const unlocked = StudyArchive.data.achievements;
        const total = this.list.length;
        const completed = unlocked.length;
        const percentage = Math.round((completed / total) * 100);

        document.getElementById("achievementCount").textContent =
            `${completed}/${total}`;

        document.getElementById("achievementPercentage").textContent =
            `${percentage}%`;

        document.getElementById("achievementProgressBar").style.width =
            `${percentage}%`;

        grid.innerHTML = this.list.map(achievement => {
            const isUnlocked = unlocked.includes(achievement.id);

            return `
                <article class="achievement-card ${isUnlocked ? "unlocked" : "locked"}">
                    <span class="achievement-status">
                        ${isUnlocked ? "Unlocked" : "Locked"}
                    </span>

                    <div class="achievement-icon">
                        <i data-lucide="${achievement.icon}" aria-hidden="true"></i>
                    </div>

                    <h3>${achievement.title}</h3>
                    <p>${achievement.description}</p>

                    <span class="achievement-reward">
                        <i data-lucide="gem" aria-hidden="true"></i> ${achievement.reward} crystals
                    </span>
                </article>
            `;
        }).join("");

        window.lucide?.createIcons();
    }
};

// Make the achievement system accessible to main.js.
window.Achievements = Achievements;

document.addEventListener("DOMContentLoaded", () => {
    if (window.StudyArchive) {
        Achievements.init();
    }
});
