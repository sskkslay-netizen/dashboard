/* Rendering and interactions for the ACT Dashboard. */
(function () {
    "use strict";

    const SUBJECT_COLORS = {
        English: "english",
        Math: "math",
        Reading: "reading",
        Science: "science"
    };

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

    function bindEvents() {
        document.getElementById("studyTimeForm").addEventListener("submit", event => {
            event.preventDefault();
            const form = event.currentTarget;
            const minutes = Number(form.elements.minutes.value);
            const note = form.elements.note.value.trim();

            try {
                ACTData.recordStudyMinutes(minutes, note);
                form.reset();
                showMessage("Study time saved to your ACT archive.");
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
        } catch (error) {
            showMessage(error.message, true);
            console.error(error);
        }
    }

    document.addEventListener("DOMContentLoaded", init);
}());
