
/* ==========================================
   STUDY ARCHIVE — FOCUS ROOM
========================================== */

const FocusRoom = {
    mode: "focus",
    durations: {
        focus: 25,
        short: 5,
        long: 15
    },

    selectedMinutes: 25,
    remainingSeconds: 25 * 60,
    timerInterval: null,
    running: false,

    init() {
        if (!window.StudyArchive) {
            console.error("StudyArchive was not found.");
            return;
        }

        this.bindEvents();
        this.loadStats();
        this.updateTimerDisplay();
        this.renderHistory();
    },

    bindEvents() {
        document.getElementById("startTimer").addEventListener("click", () => {
            this.toggleTimer();
        });

        document.getElementById("resetTimer").addEventListener("click", () => {
            this.resetTimer();
        });

        document.getElementById("skipTimer").addEventListener("click", () => {
            this.skipTimer();
        });

        document.querySelectorAll(".timer-mode").forEach(button => {
            button.addEventListener("click", () => {
                this.setMode(button.dataset.mode);
            });
        });

        document.querySelectorAll(".preset-button").forEach(button => {
            button.addEventListener("click", () => {
                this.setPreset(Number(button.dataset.minutes));
            });
        });
    },

    toggleTimer() {
        if (this.running) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    },

    startTimer() {
        if (this.remainingSeconds <= 0) {
            this.resetTimer();
        }

        this.running = true;

        const startButton = document.getElementById("startTimer");
        startButton.textContent = "Ⅱ Pause";

        document.getElementById("timerStatus").textContent = "You're doing great. Keep going.";

        this.timerInterval = setInterval(() => {
            this.remainingSeconds--;

            this.updateTimerDisplay();

            if (this.remainingSeconds <= 0) {
                this.completeTimer();
            }
        }, 1000);
    },

    pauseTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.running = false;

        document.getElementById("startTimer").textContent = "Resume";
        document.getElementById("timerStatus").textContent = "Paused. Take your time.";
    },

    resetTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.running = false;

        this.remainingSeconds = this.selectedMinutes * 60;

        document.getElementById("startTimer").textContent = "Start focusing";
        document.getElementById("timerStatus").textContent = "Ready when you are.";

        this.updateTimerDisplay();
    },

    setMode(mode) {
        this.pauseAndClear();

        this.mode = mode;
        this.selectedMinutes = this.durations[mode];
        this.remainingSeconds = this.selectedMinutes * 60;

        document.querySelectorAll(".timer-mode").forEach(button => {
            button.classList.toggle("active", button.dataset.mode === mode);
        });

        document.getElementById("timerModeTitle").textContent =
            mode === "focus" ? "Focus time" :
            mode === "short" ? "Short break" : "Long break";

        document.getElementById("timerLabel").textContent =
            mode === "focus" ? "TIME TO FOCUS" :
            mode === "short" ? "SHORT BREAK" : "LONG BREAK";

        document.querySelectorAll(".preset-button").forEach(button => {
            button.classList.remove("active");
        });

        this.updateTimerDisplay();

        document.getElementById("timerStatus").textContent = "Ready when you are.";
    },

    setPreset(minutes) {
        this.pauseAndClear();

        this.mode = "focus";
        this.selectedMinutes = minutes;
        this.remainingSeconds = minutes * 60;

        document.querySelectorAll(".timer-mode").forEach(button => {
            button.classList.toggle("active", button.dataset.mode === "focus");
        });

        document.querySelectorAll(".preset-button").forEach(button => {
            button.classList.toggle(
                "active",
                Number(button.dataset.minutes) === minutes
            );
        });

        document.getElementById("timerModeTitle").textContent = "Focus time";
        document.getElementById("timerLabel").textContent = "TIME TO FOCUS";
        document.getElementById("timerStatus").textContent = "Ready when you are.";

        this.updateTimerDisplay();
    },

    pauseAndClear() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.running = false;

        document.getElementById("startTimer").textContent = "Start focusing";
    },

    skipTimer() {
        this.pauseAndClear();

        if (this.mode === "focus") {
            this.setMode("short");
        } else {
            this.setMode("focus");
        }
    },

    updateTimerDisplay() {
        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;

        document.getElementById("timerDisplay").textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        const totalSeconds = this.selectedMinutes * 60;
        const progress = totalSeconds > 0
            ? this.remainingSeconds / totalSeconds
            : 1;

        const circumference = 2 * Math.PI * 124;

        document.getElementById("timerProgress").style.strokeDashoffset =
            circumference * (1 - progress);
    },

    completeTimer() {
        this.pauseAndClear();

        this.remainingSeconds = 0;
        this.updateTimerDisplay();

        document.getElementById("startTimer").textContent = "Start again";
        document.getElementById("timerStatus").textContent = "Session complete! Well done.";

        if (this.mode === "focus") {
            this.recordSession();
            alert("Focus session complete! You earned 10 crystals.");
        } else {
            alert("Break finished! Ready to focus again?");
        }
    },

    recordSession() {
        const data = StudyArchive.data;

        if (!Array.isArray(data.focusSessions)) {
            data.focusSessions = [];
        }

        const goal = document.getElementById("studyGoal").value.trim();
        const subject = document.getElementById("studySubject").value;

        const session = {
            id: Date.now(),
            goal: goal || "Study session",
            subject,
            minutes: this.selectedMinutes,
            date: new Date().toISOString()
        };

        data.focusSessions.unshift(session);

        StudyArchive.addFocusTime(this.selectedMinutes);
        StudyArchive.addCrystals(10);
        StudyArchive.save();

        this.loadStats();
        this.renderHistory();
    },

    loadStats() {
        const data = StudyArchive.data;
        const sessions = data.focusSessions || [];

        const today = new Date().toDateString();

        const todaySessions = sessions.filter(session => {
            return new Date(session.date).toDateString() === today;
        });

        const todayMinutes = todaySessions.reduce((total, session) => {
            return total + session.minutes;
        }, 0);

        const totalMinutes = data.totalFocusMinutes || 0;

        document.getElementById("todayMinutes").textContent = todayMinutes;
        document.getElementById("todaySessions").textContent = todaySessions.length;

        document.getElementById("totalFocus").textContent =
            `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
    },

    renderHistory() {
        const container = document.getElementById("focusHistory");
        const sessions = StudyArchive.data.focusSessions || [];

        if (sessions.length === 0) {
            container.innerHTML =
                '<p class="focus-empty">Your completed sessions will appear here.</p>';
            return;
        }

        container.innerHTML = sessions.slice(0, 8).map(session => {
            const date = new Date(session.date);

            return `
                <div class="focus-session-item">
                    <div class="focus-session-info">
                        <strong>${this.escapeHTML(session.goal)}</strong>
                        <span>${this.escapeHTML(session.subject)} · ${date.toLocaleDateString()} · ${session.minutes} minutes</span>
                    </div>
                    <span class="focus-session-reward">+10 crystals</span>
                </div>
            `;
        }).join("");
    },

    escapeHTML(value) {
        const element = document.createElement("div");
        element.textContent = String(value ?? "");
        return element.innerHTML;
    }
};

window.FocusRoom = FocusRoom;

document.addEventListener("DOMContentLoaded", () => {
    FocusRoom.init();
});
