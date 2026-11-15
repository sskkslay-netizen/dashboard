/* Rendering and interactions for the ACT Dashboard. */
(function () {
    "use strict";

    const SUBJECT_COLORS = {
        English: "english",
        Math: "math",
        Reading: "reading",
        Science: "science"
    };
    let focusInterval = null;
    let focusDurationSeconds = 25 * 60;
    let focusRemainingSeconds = 25 * 60;
    let focusEndTimestamp = null;
    let focusRunning = false;
    let focusCompleted = false;

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function formatStudyTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`;
    }

    function getSubjectProgress(data, subject) {
        const skills = Object.values(data.skills).filter(skill => skill.subject === subject);
        const attempted = skills.filter(skill => skill.score > 0);
        const average = attempted.length
            ? Math.round(attempted.reduce((sum, skill) => sum + skill.score, 0) / attempted.length)
            : 0;
        return { skills, attempted, average };
    }

    function renderSkills(data) {
        const container = document.getElementById("subjectSkills");
        container.innerHTML = Object.keys(ACTData.SUBJECTS).map(subject => {
            const { skills, attempted, average } = getSubjectProgress(data, subject);
            const mastered = skills.filter(skill => ACTData.getSkillLevel(skill) === "Mastery").length;
            const level = average >= 85 ? "Mastery" : average >= 40 ? "Advanced" : "Core";
            return `
                <article class="subject-card ${SUBJECT_COLORS[subject]}">
                    <div class="subject-card-top">
                        <span class="subject-dot" aria-hidden="true"></span>
                        <span class="subject-label">${subject}</span>
                        <span class="subject-level">${level}</span>
                    </div>
                    <div class="subject-progress-copy">
                        <strong>${average}%</strong>
                        <span>${attempted.length} of ${skills.length} skills practiced</span>
                    </div>
                    <div class="progress-track" role="progressbar" aria-label="${subject} average skill score" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${average}">
                        <span style="width: ${average}%"></span>
                    </div>
                    <p class="mastery-note">${mastered} ${mastered === 1 ? "skill" : "skills"} at mastery</p>
                </article>`;
        }).join("");
    }

    function renderActivity(data) {
        const items = [
            ...data.lessons.map(lesson => ({
                date: `${lesson.date}T12:00:00`,
                label: `${lesson.subject} · ${lesson.skill}`,
                detail: `Lesson quiz · ${lesson.score}%`,
                kind: "lesson"
            })),
            ...data.studySessions.map(session => ({
                date: session.date,
                label: session.note || "Study session",
                detail: `${session.minutes} minutes studied`,
                kind: "study"
            })),
            ...data.quizResults.map(result => ({
                date: result.date,
                label: `${result.subject} · ${result.skill}`,
                detail: `Quiz · ${result.score}%`,
                kind: "quiz"
            })),
            ...data.practiceTests.map(test => ({
                date: test.date,
                label: test.name || `${test.subject || "Full"} practice test`,
                detail: test.score === undefined ? "Practice test completed" : `Score · ${test.score}%`,
                kind: "test"
            }))
        ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

        const container = document.getElementById("recentActivity");
        if (!items.length) {
            container.innerHTML = '<p class="empty-state">Your study activity will appear here.</p>';
            return;
        }

        container.innerHTML = items.map(item => `
            <li class="activity-item">
                <span class="activity-mark ${item.kind}" aria-hidden="true"></span>
                <div>
                    <strong>${escapeHTML(item.label)}</strong>
                    <p>${escapeHTML(item.detail)} <span>· ${new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></p>
                </div>
            </li>`).join("");
    }

    function renderRecommendations(data) {
        const recommendations = Object.values(data.skills)
            .filter(skill => skill.manualLevel !== "Paused")
            .sort((a, b) => a.score - b.score)
            .slice(0, 3);

        document.getElementById("recommendedLessons").innerHTML = recommendations.map(skill => `
            <li>
                <a class="recommendation-link" href="lessons.html?subject=${encodeURIComponent(skill.subject)}&skill=${encodeURIComponent(skill.name)}">
                    <span class="recommendation-subject">${escapeHTML(skill.subject)}</span>
                    <strong>${escapeHTML(skill.name)}</strong>
                    <span class="recommendation-score">${skill.score}% skill score</span>
                </a>
            </li>`).join("");
    }

    function renderGoals(data) {
        const today = new Date().toISOString().slice(0, 10);
        const minutes = data.studySessions
            .filter(session => session.date.slice(0, 10) === today)
            .reduce((sum, session) => sum + session.minutes, 0);
        const lessons = data.lessons.filter(lesson => lesson.date === today && lesson.source !== "sample").length;
        const minuteGoal = Math.max(1, Number(data.goals.dailyMinutes) || 30);
        const lessonGoal = Math.max(1, Number(data.goals.dailyLessons) || 1);
        const minuteProgress = Math.min(100, Math.round(minutes / minuteGoal * 100));
        const lessonProgress = Math.min(100, Math.round(lessons / lessonGoal * 100));

        document.getElementById("dailyGoalMinutes").textContent = `${minutes} / ${minuteGoal} min`;
        document.getElementById("dailyGoalLessons").textContent = `${lessons} / ${lessonGoal} ${lessonGoal === 1 ? "lesson" : "lessons"}`;
        document.getElementById("dailyGoalMinutesBar").style.width = `${minuteProgress}%`;
        document.getElementById("dailyGoalLessonsBar").style.width = `${lessonProgress}%`;
        document.getElementById("dailyGoalMinutesBar").parentElement.setAttribute("aria-valuenow", minuteProgress);
        document.getElementById("dailyGoalLessonsBar").parentElement.setAttribute("aria-valuenow", lessonProgress);
    }

    function render(data) {
        document.getElementById("totalStudyTime").textContent = formatStudyTime(data.totalStudyMinutes);
        document.getElementById("lessonsCompleted").textContent = data.lessons.filter(lesson => lesson.completed).length;
        document.getElementById("practiceTestsTaken").textContent = data.practiceTests.length;
        try {
            document.getElementById("actCrystalBalance").textContent = ACTData.getCrystalBalance();
        } catch (error) {
            document.getElementById("actCrystalBalance").textContent = "Unavailable";
            showMessage(error.message, true);
        }
        const skillCount = Object.keys(data.skills).length;
        const completedSkillCount = new Set(
            data.lessons
                .filter(lesson => lesson.completed)
                .map(lesson => ACTData.skillId(lesson.subject, lesson.skill))
        ).size;
        const progress = skillCount
            ? Math.min(100, Math.round(completedSkillCount / skillCount * 100))
            : 0;
        document.getElementById("overallProgress").textContent = `${progress}%`;
        document.getElementById("overallProgressBar").style.width = `${Math.min(100, progress)}%`;
        document.getElementById("overallProgressBar").parentElement.setAttribute("aria-valuenow", Math.min(100, progress));
        renderSkills(data);
        renderActivity(data);
        renderRecommendations(data);
        renderGoals(data);
    }

    function showMessage(message, isError = false) {
        const element = document.getElementById("dashboardMessage");
        element.textContent = message;
        element.classList.toggle("error", isError);
    }

    function showFocusStatus(message, isError = false) {
        const element = document.getElementById("focusSprintStatus");
        element.textContent = message;
        element.classList.toggle("error", isError);
    }

    function formatCountdown(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = String(seconds % 60).padStart(2, "0");
        return `${String(minutes).padStart(2, "0")}:${remainingSeconds}`;
    }

    function renderFocusTimer() {
        const startButton = document.getElementById("startFocusSprint");
        const pauseButton = document.getElementById("pauseFocusSprint");
        const durationSelect = document.getElementById("focusDuration");
        const elapsedPercentage = Math.round(
            (focusDurationSeconds - focusRemainingSeconds) / focusDurationSeconds * 100
        );

        document.getElementById("focusClock").textContent =
            formatCountdown(focusRemainingSeconds);
        document.getElementById("focusProgressBar").style.width = `${elapsedPercentage}%`;
        document.getElementById("focusProgressTrack")
            .setAttribute("aria-valuenow", elapsedPercentage);
        startButton.disabled = focusRunning || focusCompleted;
        startButton.textContent = focusCompleted
            ? "Sprint complete"
            : focusRunning
                ? "Sprint in progress"
                : focusRemainingSeconds < focusDurationSeconds
                    ? "Resume sprint"
                    : "Start sprint";
        pauseButton.disabled = !focusRunning;
        durationSelect.disabled = focusRunning;
    }

    function clearFocusInterval() {
        if (focusInterval !== null) {
            window.clearInterval(focusInterval);
            focusInterval = null;
        }
    }

    function updateFocusTimer() {
        if (!focusRunning) return;
        focusRemainingSeconds = Math.max(
            0,
            Math.ceil((focusEndTimestamp - Date.now()) / 1000)
        );
        renderFocusTimer();
        if (focusRemainingSeconds === 0) completeFocusSprint();
    }

    function startFocusSprint() {
        if (focusRunning || focusCompleted) return;

        focusRunning = true;
        focusEndTimestamp = Date.now() + focusRemainingSeconds * 1000;
        showFocusStatus("Sprint in progress. You can pause whenever you need.");
        renderFocusTimer();
        focusInterval = window.setInterval(updateFocusTimer, 1000);
        updateFocusTimer();
    }

    function pauseFocusSprint() {
        if (!focusRunning) return;
        focusRemainingSeconds = Math.max(
            0,
            Math.ceil((focusEndTimestamp - Date.now()) / 1000)
        );
        if (focusRemainingSeconds === 0) {
            completeFocusSprint();
            return;
        }

        focusRunning = false;
        focusEndTimestamp = null;
        clearFocusInterval();
        renderFocusTimer();
        showFocusStatus("Sprint paused. Resume when you are ready.");
    }

    function resetFocusSprint() {
        focusRunning = false;
        focusCompleted = false;
        focusEndTimestamp = null;
        clearFocusInterval();
        focusDurationSeconds = Number(document.getElementById("focusDuration").value) * 60;
        focusRemainingSeconds = focusDurationSeconds;
        renderFocusTimer();
        showFocusStatus("Timer reset. Ready when you are.");
    }

    function saveStudySession(minutes, note) {
        const saved = ACTData.recordStudyMinutes(minutes, note);
        const session = saved.studySessions.at(-1);
        try {
            const reward = ACTData.awardCrystals(
                session.id,
                Math.min(35, 5 + Math.floor(minutes / 10))
            );
            return {
                message: `Study time saved to your ACT archive. You earned ${reward} crystals.`,
                isError: false
            };
        } catch (error) {
            return {
                message: `Study time saved, but crystals could not be added: ${error.message}`,
                isError: true
            };
        }
    }

    function completeFocusSprint() {
        focusRunning = false;
        focusCompleted = true;
        focusEndTimestamp = null;
        focusRemainingSeconds = 0;
        clearFocusInterval();
        renderFocusTimer();

        const minutes = Number(document.getElementById("focusDuration").value);
        const focusArea = document.getElementById("focusArea").value;
        try {
            const result = saveStudySession(minutes, `ACT focus sprint: ${focusArea}`);
            showFocusStatus(
                result.isError
                    ? `Sprint complete. ${result.message}`
                    : `Sprint complete and logged. ${result.message}`,
                result.isError
            );
        } catch (error) {
            showFocusStatus(
                `Sprint complete, but study time could not be saved: ${error.message}`,
                true
            );
        }
    }

    function bindEvents() {
        document.getElementById("focusDuration").addEventListener("change", () => {
            focusDurationSeconds = Number(document.getElementById("focusDuration").value) * 60;
            focusRemainingSeconds = focusDurationSeconds;
            focusCompleted = false;
            renderFocusTimer();
            showFocusStatus("Sprint length updated. Ready when you are.");
        });
        document.getElementById("startFocusSprint")
            .addEventListener("click", startFocusSprint);
        document.getElementById("pauseFocusSprint")
            .addEventListener("click", pauseFocusSprint);
        document.getElementById("resetFocusSprint")
            .addEventListener("click", resetFocusSprint);
        document.addEventListener("visibilitychange", updateFocusTimer);

        document.getElementById("studyTimeForm").addEventListener("submit", event => {
            event.preventDefault();
            const form = event.currentTarget;
            const minutes = Number(form.elements.minutes.value);
            const note = form.elements.note.value.trim();

            try {
                const result = saveStudySession(minutes, note);
                form.reset();
                showMessage(result.message, result.isError);
            } catch (error) {
                showMessage(error.message, true);
            }
        });
    }

    function init() {
        try {
            ACTData.init();
            render(ACTData.getState());
            ACTData.subscribe(render);
            bindEvents();
            renderFocusTimer();
        } catch (error) {
            showMessage(error.message, true);
            console.error(error);
        }
    }

    document.addEventListener("DOMContentLoaded", init);
}());
