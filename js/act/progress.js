/* Render ACT lesson, quiz, and skill progress. */
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

    function dateValue(value) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
            const [year, month, day] = value.split("-").map(Number);
            return new Date(year, month - 1, day);
        }
        return new Date(value);
    }

    function formatDate(value) {
        const date = dateValue(value);
        return Number.isFinite(date.getTime())
            ? date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
            : "Date unavailable";
    }

    function getFilters() {
        return {
            subject: document.getElementById("subjectFilter").value,
            level: document.getElementById("levelFilter").value
        };
    }

    function matchesFilters(skill, filters) {
        return (filters.subject === "all" || skill.subject === filters.subject) &&
            (filters.level === "all" || ACTData.getSkillLevel(skill) === filters.level);
    }

    function renderSubjectProgress(data, filters) {
        const subjects = Object.keys(ACTData.SUBJECTS)
            .filter(subject => filters.subject === "all" || subject === filters.subject);
        document.getElementById("subjectProgress").innerHTML = subjects.map(subject => {
            const skills = Object.values(data.skills).filter(skill =>
                skill.subject === subject &&
                (filters.level === "all" || ACTData.getSkillLevel(skill) === filters.level)
            );
            const attempted = skills.filter(skill => skill.score > 0);
            const average = attempted.length
                ? Math.round(attempted.reduce((sum, skill) => sum + skill.score, 0) / attempted.length)
                : 0;
            return `
                <article class="subject-progress-card ${SUBJECT_COLORS[subject]}">
                    <h3>${subject}</h3>
                    <div class="subject-progress-stat">
                        <strong>${average}%</strong>
                        <span>${attempted.length} of ${skills.length} skills practiced</span>
                    </div>
                    <div class="progress-track" role="progressbar" aria-label="${subject} average skill score" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${average}">
                        <span style="width: ${average}%"></span>
                    </div>
                    <p>Average of practiced skill scores</p>
                </article>`;
        }).join("");
    }

    function renderSkills(data, filters) {
        const skills = Object.values(data.skills).filter(skill => matchesFilters(skill, filters));
        const container = document.getElementById("skillProgress");
        if (!skills.length) {
            container.innerHTML = '<p class="skill-empty">No skills match those filters.</p>';
            return;
        }

        container.innerHTML = skills.sort((a, b) =>
            a.subject.localeCompare(b.subject) || a.name.localeCompare(b.name)
        ).map(skill => {
            const level = ACTData.getSkillLevel(skill);
            const score = Math.max(0, Math.min(100, Number(skill.score) || 0));
            const levelClass = level === "Mastery" ? "mastery" : level === "Paused" ? "paused" : "";
            return `
                <article class="skill-progress-item">
                    <div class="skill-progress-heading">
                        <span class="skill-progress-name">${escapeHTML(skill.name)}</span>
                        <span class="skill-progress-meta"><span class="skill-level-pill ${levelClass}">${escapeHTML(level)}</span>${score}%</span>
                    </div>
                    <div class="progress-track" role="progressbar" aria-label="${escapeHTML(skill.subject)}: ${escapeHTML(skill.name)} skill score" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${score}">
                        <span style="width: ${score}%"></span>
                    </div>
                </article>`;
        }).join("");
    }

    function getObservations(data) {
        return [
            ...data.lessons.filter(item => item.completed).map(item => ({
                subject: item.subject,
                skill: item.skill,
                date: item.date,
                score: Number.isFinite(item.skillScore) ? item.skillScore : item.score,
                kind: "Lesson"
            })),
            ...data.quizResults.map(item => ({
                subject: item.subject,
                skill: item.skill,
                date: item.date,
                score: item.score,
                kind: "Quiz"
            }))
        ].filter(item => Number.isFinite(item.score));
    }

    function startOfWeek(date) {
        const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        start.setDate(start.getDate() - (start.getDay() + 6) % 7);
        return start;
    }

    function renderTrend(data) {
        const now = new Date();
        const currentWeek = startOfWeek(now);
        const weeks = Array.from({ length: 8 }, (_, index) => {
            const start = new Date(currentWeek);
            start.setDate(start.getDate() - (7 * (7 - index)));
            return { start, scores: [] };
        });

        getObservations(data).forEach(item => {
            const date = dateValue(item.date);
            if (!Number.isFinite(date.getTime())) return;
            const weekIndex = Math.round((startOfWeek(date) - weeks[0].start) / (7 * 24 * 60 * 60 * 1000));
            if (weekIndex >= 0 && weekIndex < weeks.length) weeks[weekIndex].scores.push(item.score);
        });
        weeks.forEach(week => {
            week.average = week.scores.length
                ? Math.round(week.scores.reduce((sum, score) => sum + score, 0) / week.scores.length)
                : null;
        });

        const available = weeks.some(week => week.average !== null);
        const container = document.getElementById("scoreTrend");
        if (!available) {
            container.innerHTML = '<div class="trend-empty">Your quiz scores will appear here as you complete lessons and quizzes.</div>';
            return;
        }

        const chartTop = 24;
        const chartBottom = 164;
        const chartLeft = 52;
        const chartWidth = 540;
        const xPosition = index => chartLeft + index * (chartWidth / 7);
        const yPosition = score => chartBottom - score / 100 * (chartBottom - chartTop);
        const points = weeks.map((week, index) => week.average === null
            ? null
            : `${xPosition(index)},${yPosition(week.average)}`
        ).filter(Boolean);
        const grid = [0, 50, 100].map(score => {
            const y = yPosition(score);
            return `<line class="trend-grid-line" x1="${chartLeft}" x2="${chartLeft + chartWidth}" y1="${y}" y2="${y}"></line>
                <text class="trend-y-label" x="30" y="${y + 3}" text-anchor="end">${score}%</text>`;
        }).join("");
        const circles = weeks.map((week, index) => week.average === null ? "" : `
            <circle class="trend-point" cx="${xPosition(index)}" cy="${yPosition(week.average)}" r="5">
                <title>${week.average}% average, week of ${formatDate(week.start)}</title>
            </circle>`).join("");
        const labels = weeks.map((week, index) => `
            <text class="trend-x-label" x="${xPosition(index)}" y="194" text-anchor="middle">
                ${week.start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </text>`).join("");

        container.innerHTML = `
            <svg viewBox="0 0 620 205" role="img" aria-label="Weekly average quiz scores over the last eight weeks">
                ${grid}
                <polyline class="trend-line" points="${points.join(" ")}"></polyline>
                ${circles}
                ${labels}
            </svg>`;
    }

    function renderImprovements(data, filters) {
        const observationsBySkill = new Map();
        getObservations(data).forEach(item => {
            const id = ACTData.skillId(item.subject, item.skill);
            const observations = observationsBySkill.get(id) || [];
            observations.push(item);
            observationsBySkill.set(id, observations);
        });

        const improvements = [];
        observationsBySkill.forEach((observations, id) => {
            const skill = data.skills[id];
            if (!skill || !matchesFilters(skill, filters)) return;
            observations.sort((a, b) => dateValue(a.date) - dateValue(b.date));
            if (observations.length < 2) return;
            const previous = observations[observations.length - 2];
            const latest = observations[observations.length - 1];
            const change = Math.round(latest.score - previous.score);
            if (change > 0) improvements.push({ skill, change, date: latest.date });
        });

        improvements.sort((a, b) => b.change - a.change || b.date.localeCompare(a.date));
        const container = document.getElementById("recentImprovements");
        if (!improvements.length) {
            container.innerHTML = '<li class="progress-record-empty">Keep practicing; new improvements will show up here.</li>';
            return;
        }
        container.innerHTML = improvements.slice(0, 5).map(item => `
            <li class="progress-record">
                <strong>${escapeHTML(item.skill.name)}</strong>
                <span>+${item.change} pts</span>
                <small>${escapeHTML(item.skill.subject)} · latest attempt ${formatDate(item.date)}</small>
            </li>`).join("");
    }

    function renderLessons(data, filters) {
        const lessons = data.lessons.filter(lesson => lesson.completed).filter(lesson => {
            const skill = data.skills[ACTData.skillId(lesson.subject, lesson.skill)];
            return skill && matchesFilters(skill, filters);
        }).sort((a, b) => dateValue(b.date) - dateValue(a.date));
        document.getElementById("lessonCount").textContent =
            `${lessons.length} completed ${lessons.length === 1 ? "lesson" : "lessons"} in this view`;
        const container = document.getElementById("completedLessons");
        container.innerHTML = lessons.length ? lessons.slice(0, 10).map(lesson => `
            <li class="progress-record">
                <strong>${escapeHTML(lesson.skill)}</strong>
                <span>${escapeHTML(String(lesson.score))}%</span>
                <small>${escapeHTML(lesson.subject)} · ${formatDate(lesson.date)}</small>
            </li>`).join("") :
            '<li class="progress-record-empty">No completed lessons match those filters yet.</li>';
    }

    function renderQuizScores(data, filters) {
        const scores = data.quizResults.filter(result => {
            const skill = data.skills[ACTData.skillId(result.subject, result.skill)];
            return skill && matchesFilters(skill, filters);
        }).sort((a, b) => dateValue(b.date) - dateValue(a.date));
        const container = document.getElementById("quizScores");
        container.innerHTML = scores.length ? scores.slice(0, 10).map(result => `
            <li class="progress-record">
                <strong>${escapeHTML(result.skill)}</strong>
                <span>${escapeHTML(String(result.score))}%</span>
                <small>${escapeHTML(result.subject)} · ${formatDate(result.date)}</small>
            </li>`).join("") :
            '<li class="progress-record-empty">No saved quiz attempts match those filters yet.</li>';
    }

    function render(data) {
        const filters = getFilters();
        renderTrend(data);
        renderSubjectProgress(data, filters);
        renderSkills(data, filters);
        renderImprovements(data, filters);
        renderLessons(data, filters);
        renderQuizScores(data, filters);
    }

    function init() {
        try {
            ACTData.init();
            const refresh = () => render(ACTData.getState());
            ACTData.subscribe(refresh);
            refresh();
            document.getElementById("subjectFilter").addEventListener("change", refresh);
            document.getElementById("levelFilter").addEventListener("change", refresh);
        } catch (error) {
            const container = document.getElementById("skillProgress");
            container.innerHTML = `<p class="skill-empty">${escapeHTML(error.message)}</p>`;
            console.error(error);
        }
    }

    document.addEventListener("DOMContentLoaded", init);
}());
