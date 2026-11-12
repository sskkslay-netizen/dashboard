
/* ==========================================
   STUDY ARCHIVE
   Dashboard Script
   ========================================== */

const Dashboard = {

    init() {
        this.updateStats();
        this.updateDateLabels();
        this.setupMissions();
        this.updateProgress();
        this.renderUpcoming();
        this.updateRecentActivity();
    },

    dateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    },

    parseDate(value) {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ""));
        if (!match) return null;

        const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        return this.dateKey(date) === value ? date : null;
    },

    updateDateLabels() {
        const today = new Date();
        const dashboardDate = document.getElementById("dashboardDate");
        const missionDate = document.getElementById("missionDate");
        const label = today.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric"
        });

        if (dashboardDate) {
            dashboardDate.textContent = label.toUpperCase();
        }

        if (missionDate) {
            missionDate.textContent = today.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric"
            }).toUpperCase();
        }
    },

    // Update dashboard statistics
    updateStats() {
        const data = StudyArchive.data;

        const subjectCount = document.getElementById("subjectCount");
        const focusMinutes = document.getElementById("focusMinutes");
        const characterCount = document.getElementById("characterCount");

        if (subjectCount) {
            subjectCount.textContent =
                document.querySelectorAll(".subject-card").length;
        }

        if (focusMinutes) {
            focusMinutes.textContent = data.totalFocusMinutes;
        }

        if (characterCount) {
            characterCount.textContent = data.characters.length;
        }

        StudyArchive.updateDisplay();
    },

    // Set up daily mission checkboxes
    setupMissions() {
        const checkboxes = document.querySelectorAll(
            "[data-mission]"
        );
        const todayKey = this.dateKey(new Date());

        checkboxes.forEach(checkbox => {
            const missionId = `${todayKey}:${checkbox.dataset.mission}`;
            const reward = Number(checkbox.dataset.reward);
            const rewardAmount = Number.isFinite(reward) && reward > 0 ? reward : 10;

            // Restore saved completion status
            checkbox.checked =
                StudyArchive.data.completedMissions.includes(missionId);

            checkbox.disabled = checkbox.checked;

            checkbox.addEventListener("change", () => {
                if (!checkbox.checked) return;

                const completed = StudyArchive.completeMission(
                    missionId,
                    rewardAmount
                );

                if (completed) {
                    checkbox.disabled = true;
                    this.updateRecentActivity();
                    this.showMessage(`+${rewardAmount} crystals earned!`);
                } else {
                    checkbox.checked = false;
                }

                this.updateStats();
            });
        });
    },

    // Update weekly progress
    updateProgress() {
        const data = StudyArchive.data;
        const weeklyMinutes = document.getElementById("weeklyMinutes");
        const weeklyProgress = document.getElementById("weeklyProgress");
        const now = new Date();
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const daysSinceMonday = (weekStart.getDay() + 6) % 7;
        weekStart.setDate(weekStart.getDate() - daysSinceMonday);
        const nextWeekStart = new Date(weekStart);
        nextWeekStart.setDate(nextWeekStart.getDate() + 7);
        const sessions = Array.isArray(data.focusSessions) ? data.focusSessions : [];
        const minutesThisWeek = sessions.reduce((total, session) => {
            const sessionDate = new Date(session.date);
            const minutes = Number(session.minutes);

            if (
                Number.isFinite(sessionDate.getTime()) &&
                sessionDate >= weekStart &&
                sessionDate < nextWeekStart &&
                Number.isFinite(minutes) &&
                minutes > 0
            ) {
                return total + minutes;
            }

            return total;
        }, 0);

        if (weeklyMinutes) {
            weeklyMinutes.textContent = minutesThisWeek;
        }

        if (weeklyProgress) {
            const goal = 180;
            const percentage = Math.min((minutesThisWeek / goal) * 100, 100);
            weeklyProgress.style.width = percentage + "%";
            weeklyProgress.setAttribute("aria-valuenow", String(Math.min(minutesThisWeek, goal)));
        }
    },

    renderUpcoming() {
        const container = document.getElementById("upcomingList");
        const count = document.getElementById("upcomingCount");
        if (!container) return;

        const todayKey = this.dateKey(new Date());
        const assignments = Array.isArray(StudyArchive.data.assignments)
            ? StudyArchive.data.assignments
            : [];
        const calendarEvents = Array.isArray(StudyArchive.data.calendarEvents)
            ? StudyArchive.data.calendarEvents
            : [];
        const upcoming = [
            ...assignments
                .filter(item => item.status !== "completed")
                .map(item => {
                    const date = this.parseDate(item.dueDate);
                    return date && this.dateKey(date) >= todayKey
                        ? { type: "assignment", title: item.title, date: this.dateKey(date) }
                        : null;
                })
                .filter(Boolean),
            ...calendarEvents
                .map(item => {
                    const date = this.parseDate(item.date);
                    return date && this.dateKey(date) >= todayKey
                        ? {
                            type: "event",
                            title: item.title,
                            date: this.dateKey(date),
                            start: item.allDay ? "" : item.start || ""
                        }
                        : null;
                })
                .filter(Boolean)
        ]
            .sort((a, b) => a.date.localeCompare(b.date) ||
                (a.start || "").localeCompare(b.start || ""))
            .slice(0, 5);

        container.replaceChildren();

        if (count) {
            count.textContent = String(upcoming.length);
        }

        if (!upcoming.length) {
            const empty = document.createElement("p");
            empty.className = "empty-state";
            empty.textContent = "Nothing coming up yet. Add a deadline or plan an event when you're ready.";
            container.appendChild(empty);
            return;
        }

        upcoming.forEach(item => {
            const link = document.createElement("a");
            const date = this.parseDate(item.date);
            const dateLabel = date.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric"
            });
            const details = document.createElement("span");
            const title = document.createElement("strong");
            const subtitle = document.createElement("small");

            link.className = `upcoming-item ${item.type}`;
            link.href = item.type === "assignment"
                ? "pages/assignments.html"
                : "pages/calendar.html";
            title.textContent = item.title || "Untitled";
            subtitle.textContent = item.type === "assignment"
                ? `Assignment · Due ${dateLabel}`
                : `${item.start ? `${this.formatTime(item.start)} · ` : "All day · "}${dateLabel}`;
            details.append(title, subtitle);
            link.append(details, this.makeElement("span", "upcoming-arrow", "↗"));
            container.appendChild(link);
        });
    },

    // Update recent activity
    updateRecentActivity() {
        const activity = document.getElementById("recentActivity");

        if (!activity) return;

        const missionNames = {
            review: "Reviewed your notes",
            focus: "Completed a focus session",
            assignment: "Completed an assignment"
        };
        const missionActivity = StudyArchive.data.completedMissions
            .filter(id => typeof id === "string" && /^\d{4}-\d{2}-\d{2}:.+$/.test(id))
            .map(id => {
                const [dateKey, missionId] = id.split(":");
                return {
                    title: missionNames[missionId] || "Completed a daily mission",
                    date: this.parseDate(dateKey)
                };
            })
            .filter(item => item.date);
        const focusActivity = (Array.isArray(StudyArchive.data.focusSessions)
            ? StudyArchive.data.focusSessions
            : [])
            .map(session => ({
                title: session.goal || "Focus session",
                detail: `${session.minutes} minutes of focused study`,
                date: new Date(session.date)
            }))
            .filter(item => Number.isFinite(item.date.getTime()));
        const recent = [...missionActivity, ...focusActivity]
            .sort((a, b) => b.date - a.date)
            .slice(0, 5);

        activity.replaceChildren();

        if (!recent.length) {
            const empty = this.makeElement(
                "p",
                "empty-message",
                "Your study adventures will appear here as you use your archive."
            );
            activity.appendChild(empty);
            return;
        }

        recent.forEach(item => {
            const row = this.makeElement("div", "activity-item");
            const marker = this.makeElement("span", "activity-marker");
            const details = this.makeElement("span", "activity-information");
            const title = this.makeElement("strong", "", item.title);
            const subtitle = this.makeElement(
                "small",
                "",
                item.detail || item.date.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric"
                })
            );

            details.append(title, subtitle);
            row.append(marker, details);
            activity.appendChild(row);
        });
    },

    formatTime(value) {
        const [hours, minutes] = value.split(":").map(Number);
        if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return "";

        return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit"
        });
    },

    makeElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        element.textContent = text;
        return element;
    },

    // Show a small notification
    showMessage(message) {
        let notification = document.getElementById(
            "dashboardNotification"
        );

        if (!notification) {
            notification = document.createElement("div");
            notification.id = "dashboardNotification";
            notification.className = "dashboard-notification";
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.classList.add("visible");

        setTimeout(() => {
            notification.classList.remove("visible");
        }, 2500);
    }
};

// Start dashboard after the shared data loads
document.addEventListener("DOMContentLoaded", () => {
    Dashboard.init();
});
