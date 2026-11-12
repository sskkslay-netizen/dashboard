/* Aggregate ACT study activity into useful summaries and charts. */
(function () {
    "use strict";

    function formatTime(minutes) {
        return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    }

    function dateValue(value) {
        const date = new Date(value);
        return Number.isFinite(date.getTime()) ? date : null;
    }

    function attemptedSkillIds(data) {
        return new Set([
            ...data.lessons.map(lesson => ACTData.skillId(lesson.subject, lesson.skill)),
            ...data.quizResults.map(result => ACTData.skillId(result.subject, result.skill))
        ]);
    }

    function startOfWeek(date) {
        const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        start.setDate(start.getDate() - (start.getDay() + 6) % 7);
        return start;
    }

    function renderSummary(data) {
        const scores = [
            ...data.quizSessions.map(session => Number(session.score)),
            ...data.lessons.filter(lesson => lesson.completed).map(lesson => Number(lesson.score))
        ].filter(Number.isFinite);
        const skills = Object.values(data.skills);
        const attempted = attemptedSkillIds(data);
        const mastered = skills.filter(skill => ACTData.getSkillLevel(skill) === "Mastery").length;
        const masteryPercent = skills.length ? Math.round(mastered / skills.length * 100) : 0;
        const subjectAverages = Object.keys(ACTData.SUBJECTS).map(subject => {
            const subjectSkills = skills.filter(skill =>
                skill.subject === subject && attempted.has(skill.id)
            );
            return {
                subject,
                average: subjectSkills.length
                    ? Math.round(subjectSkills.reduce((sum, skill) => sum + skill.score, 0) / subjectSkills.length)
                    : null
            };
        }).filter(item => item.average !== null);
        subjectAverages.sort((a, b) => b.average - a.average);
        const best = subjectAverages[0]?.subject || "Not enough data";
        const difficult = subjectAverages.at(-1)?.subject || "Not enough data";
        const averageQuiz = scores.length
            ? `${Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)}%`
            : "—";
        const cards = [
            ["Total study time", formatTime(data.totalStudyMinutes), "ACT time logged in this browser"],
            ["Lessons completed", data.lessons.filter(lesson => lesson.completed).length, "Including the saved lesson history"],
            ["Quizzes taken", data.quizSessions.length + data.lessons.filter(lesson => lesson.completed).length, `Average quiz score: ${averageQuiz}`],
            ["Practice tests", data.practiceTests.length, "In-app and outside test records"],
            ["Best subject", best, "Highest average practiced skill score"],
            ["Most difficult", difficult, "Lowest average among practiced subjects"],
            ["Skill mastery", `${masteryPercent}%`, `${mastered} of ${skills.length} skills at mastery`],
            ["Weekly goal", `${data.goals.weeklyLessons} lessons`, "Your current weekly lesson target"]
        ];
        document.getElementById("statisticsSummary").innerHTML = cards.map(([label, value, caption]) => `
            <article class="statistics-card"><span>${label}</span><strong>${value}</strong><p>${caption}</p></article>`).join("");
    }

    function renderWeeklyStudy(data) {
        const now = new Date();
        const weekStart = startOfWeek(now);
        const weeks = Array.from({ length: 8 }, (_, index) => {
            const start = new Date(weekStart);
            start.setDate(start.getDate() - 7 * (7 - index));
            return { start, minutes: 0 };
        });
        data.studySessions.forEach(session => {
            const date = dateValue(session.date);
            const minutes = Number(session.minutes);
            if (!date || !Number.isFinite(minutes) || minutes <= 0) return;
            const weekIndex = Math.round((startOfWeek(date) - weeks[0].start) / (7 * 86400000));
            if (weekIndex >= 0 && weekIndex < weeks.length) weeks[weekIndex].minutes += minutes;
        });
        const max = Math.max(30, ...weeks.map(week => week.minutes));
        const chart = document.getElementById("weeklyStudyChart");
        if (!weeks.some(week => week.minutes)) {
            chart.innerHTML = '<div class="study-chart-empty">Log a study session on the ACT Dashboard to start your weekly chart.</div>';
            return;
        }
        const chartTop = 24;
        const chartBottom = 175;
        const barWidth = 42;
        const gap = 22;
        const bars = weeks.map((week, index) => {
            const x = 35 + index * (barWidth + gap);
            const height = week.minutes / max * 125;
            const y = chartBottom - height;
            const label = week.start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
            return `
                <rect class="study-bar-track" x="${x}" y="${chartTop}" width="${barWidth}" height="${chartBottom - chartTop}" rx="7"></rect>
                <rect class="study-bar ${index === weeks.length - 1 ? "current" : ""}" x="${x}" y="${y}" width="${barWidth}" height="${height}" rx="7"></rect>
                <text class="study-bar-value" x="${x + barWidth / 2}" y="${Math.max(14, y - 5)}" text-anchor="middle">${week.minutes}</text>
                <text class="study-bar-label" x="${x + barWidth / 2}" y="195" text-anchor="middle">${label}</text>`;
        }).join("");
        chart.innerHTML = `<svg viewBox="0 0 565 205" role="img" aria-label="Weekly ACT study minutes for the last eight weeks">${bars}</svg>`;
    }

    function renderSubjects(data) {
        const skills = Object.values(data.skills);
        const attempted = attemptedSkillIds(data);
        document.getElementById("subjectStatistics").innerHTML = Object.keys(ACTData.SUBJECTS).map(subject => {
            const subjectSkills = skills.filter(skill =>
                skill.subject === subject && attempted.has(skill.id)
            );
            if (!subjectSkills.length) {
                return `<div class="subject-stat-row"><strong>${subject}</strong><div class="progress-track"><span style="width:0%"></span></div><span>—</span></div>`;
            }
            const average = Math.round(subjectSkills.reduce((sum, skill) => sum + skill.score, 0) / subjectSkills.length);
            return `
                <div class="subject-stat-row">
                    <strong>${subject}</strong>
                    <div class="progress-track" role="progressbar" aria-label="${subject} average skill score" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${average}"><span style="width:${average}%"></span></div>
                    <span>${average}%</span>
                </div>`;
        }).join("");
    }

    function render(data) {
        renderSummary(data);
        renderWeeklyStudy(data);
        renderSubjects(data);
    }

    function init() {
        try {
            ACTData.init();
            render(ACTData.getState());
            ACTData.subscribe(render);
        } catch (error) {
            document.getElementById("statisticsSummary").textContent = error.message;
            console.error(error);
        }
    }

    document.addEventListener("DOMContentLoaded", init);
}());
