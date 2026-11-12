/* Practice test flow, score scaling, and outside test score entry. */
(function () {
    "use strict";

    let activeQuestions = [];
    let activeSubject = "all";
    let currentIndex = 0;
    let answers = {};
    let reviewFlags = {};
    let submitted = false;

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[character]);
    }

    function showMessage(id, message, isError = false) {
        const element = document.getElementById(id);
        element.textContent = message;
        element.classList.toggle("error", isError);
    }

    function availableQuestions() {
        const subject = document.getElementById("practiceSubject").value;
        return ACTQuestionBank.filter(question => subject === "all" || question.subject === subject);
    }

    function shuffle(items) {
        const result = [...items];
        for (let index = result.length - 1; index > 0; index--) {
            const other = Math.floor(Math.random() * (index + 1));
            [result[index], result[other]] = [result[other], result[index]];
        }
        return result;
    }

    function chooseTestQuestions(pool, count, subject) {
        if (subject !== "all") return shuffle(pool).slice(0, count);
        const subjects = ["English", "Math", "Reading", "Science"];
        const chosen = [];
        const remaining = [];
        subjects.forEach(name => {
            const section = shuffle(pool.filter(question => question.subject === name));
            if (section.length) chosen.push(section.shift());
            remaining.push(...section);
        });
        return [...chosen, ...shuffle(remaining)].slice(0, count);
    }

    function updateAvailable() {
        const count = document.getElementById("practiceQuestionCount");
        const total = availableQuestions().length;
        count.max = total;
        if (Number(count.value) > total) count.value = total || 1;
        showMessage("practiceBuilderMessage", `${total} original questions available in this test selection.`);
    }

    function renderNavigation() {
        document.getElementById("questionNavigation").innerHTML = activeQuestions.map((question, index) => `
            <button type="button" class="question-nav-button ${index === currentIndex ? "current" : ""} ${answers[index] !== undefined ? "answered" : ""} ${reviewFlags[index] ? "flagged" : ""}" data-question-index="${index}" aria-label="Question ${index + 1}${answers[index] !== undefined ? ", answered" : ""}${reviewFlags[index] ? ", marked for review" : ""}">
                ${index + 1}${reviewFlags[index] ? " ·" : ""}
            </button>`).join("");
    }

    function renderQuestion() {
        if (!activeQuestions.length) return;
        const question = activeQuestions[currentIndex];
        document.getElementById("testPosition").textContent =
            `Question ${currentIndex + 1} of ${activeQuestions.length}`;
        document.getElementById("testQuestion").innerHTML = `
            <div class="test-question-top">${escapeHTML(question.subject)} · ${escapeHTML(question.skill)}</div>
            <h3>${escapeHTML(question.prompt)}</h3>
            <div class="test-options">
                ${question.options.map((option, index) => `
                    <label class="test-option">
                        <input type="radio" name="test-answer" value="${index}" ${answers[currentIndex] === index ? "checked" : ""} ${submitted ? "disabled" : ""}>
                        <span>${String.fromCharCode(65 + index)}. ${escapeHTML(option)}</span>
                    </label>`).join("")}
            </div>`;
        document.getElementById("testPrevious").disabled = currentIndex === 0;
        document.getElementById("testNext").disabled = currentIndex === activeQuestions.length - 1;
        const flag = document.getElementById("markForReview");
        flag.setAttribute("aria-pressed", String(Boolean(reviewFlags[currentIndex])));
        flag.textContent = reviewFlags[currentIndex] ? "Remove review mark" : "Mark for review";
        document.getElementById("submitPracticeTest").hidden = submitted;
        renderNavigation();
    }

    function startTest(event) {
        event.preventDefault();
        const pool = availableQuestions();
        const count = Number(document.getElementById("practiceQuestionCount").value);
        if (!pool.length || !Number.isInteger(count) || count < 1 || count > pool.length) {
            showMessage("practiceBuilderMessage", "Choose a question count available in this test selection.", true);
            return;
        }
        activeSubject = document.getElementById("practiceSubject").value;
        activeQuestions = chooseTestQuestions(pool, count, activeSubject);
        currentIndex = 0;
        answers = {};
        reviewFlags = {};
        submitted = false;
        document.getElementById("testWorkspace").hidden = false;
        document.getElementById("testResults").hidden = true;
        document.getElementById("testMeta").textContent =
            activeSubject === "all" ? "FULL PRACTICE · ALL FOUR SECTIONS" : `${activeSubject.toUpperCase()} PRACTICE`;
        showMessage("testMessage", "");
        renderQuestion();
        document.getElementById("testWorkspace").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function scaledScore(correct, total) {
        return total ? Math.max(1, Math.min(36, Math.round(correct / total * 35) + 1)) : 1;
    }

    function submitTest() {
        if (submitted || !activeQuestions.length) return;
        const correctCount = activeQuestions.reduce((total, question, index) =>
            total + (answers[index] === question.answer ? 1 : 0), 0);
        const sections = new Map();
        activeQuestions.forEach((question, index) => {
            const section = sections.get(question.subject) || { correct: 0, total: 0 };
            section.total++;
            if (answers[index] === question.answer) section.correct++;
            sections.set(question.subject, section);
        });
        const sectionScores = Object.fromEntries([...sections.entries()].map(([subject, section]) =>
            [subject, scaledScore(section.correct, section.total)]
        ));
        const values = Object.values(sectionScores);
        const compositeScore = Math.round(values.reduce((sum, score) => sum + score, 0) / values.length);
        const score = Math.round(correctCount / activeQuestions.length * 100);
        const flaggedCount = Object.values(reviewFlags).filter(Boolean).length;
        try {
            ACTData.recordPracticeTest({
                name: activeSubject === "all" ? "Full ACT practice" : `${activeSubject} practice`,
                subject: activeSubject === "all" ? "Full" : activeSubject,
                source: "ACT Study Center",
                score,
                compositeScore,
                sectionScores,
                writingScore: null,
                totalQuestions: activeQuestions.length,
                correctCount,
                flaggedCount
            });
        } catch (error) {
            showMessage("testMessage", error.message, true);
            return;
        }

        submitted = true;
        renderQuestion();
        const results = document.getElementById("testResults");
        const sectionCards = ["English", "Math", "Reading", "Science"].map(subject =>
            `<div class="test-result-score"><strong>${sectionScores[subject] ?? "—"}</strong><span>${subject}</span></div>`
        ).join("");
        results.innerHTML = `
            <h3>Composite ${compositeScore}</h3>
            <p>${correctCount} of ${activeQuestions.length} correct (${score}%). ${flaggedCount} marked ${flaggedCount === 1 ? "question" : "questions"} for review.</p>
            <div class="test-result-grid">
                <div class="test-result-score"><strong>${compositeScore}</strong><span>Composite</span></div>
                ${sectionCards}
            </div>
            <p>These are approximate practice estimates based on this short original question set, not official ACT score conversions.</p>`;
        results.hidden = false;
        document.getElementById("testResults").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function renderSavedTests(data) {
        const list = document.getElementById("savedPracticeTests");
        const tests = [...data.practiceTests].sort((a, b) => String(b.date).localeCompare(String(a.date)));
        list.innerHTML = tests.length ? tests.map(test => {
            const date = test.date ? new Date(test.date).toLocaleDateString(undefined, {
                year: "numeric", month: "short", day: "numeric"
            }) : "Date unavailable";
            const score = test.compositeScore ? `Composite ${escapeHTML(test.compositeScore)}` :
                Number.isFinite(test.score) ? `${escapeHTML(test.score)}%` : "Scores logged";
            return `<li class="saved-test-row">
                <div><strong>${escapeHTML(test.name || `${test.subject || "ACT"} practice test`)}</strong><small>${escapeHTML(date)} · ${escapeHTML(test.source || "Outside test")}</small></div>
                <span>${score}</span>
            </li>`;
        }).join("") : '<li class="saved-test-empty">Your saved practice-test results will appear here.</li>';
    }

    function saveExternalScores(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const values = new FormData(form);
        const sectionScores = {};
        ["English", "Math", "Reading", "Science"].forEach(subject => {
            const raw = values.get(subject);
            if (raw !== "") sectionScores[subject] = Number(raw);
        });
        const writingValue = values.get("writingScore");
        try {
            ACTData.recordPracticeTest({
                name: String(values.get("name")).trim(),
                subject: "Full",
                source: "Outside test",
                date: new Date(`${values.get("date")}T12:00:00`).toISOString(),
                compositeScore: Number(values.get("compositeScore")),
                sectionScores,
                writingScore: writingValue === "" ? null : Number(writingValue)
            });
            form.reset();
            showMessage("externalScoreMessage", "Outside test scores saved.");
        } catch (error) {
            showMessage("externalScoreMessage", error.message, true);
        }
    }

    function init() {
        try {
            ACTData.init();
            const refresh = () => renderSavedTests(ACTData.getState());
            ACTData.subscribe(refresh);
            refresh();
            updateAvailable();
            document.getElementById("practiceSubject").addEventListener("change", updateAvailable);
            document.getElementById("practiceBuilder").addEventListener("submit", startTest);
            document.getElementById("testPrevious").addEventListener("click", () => {
                if (currentIndex > 0) { currentIndex--; renderQuestion(); }
            });
            document.getElementById("testNext").addEventListener("click", () => {
                if (currentIndex < activeQuestions.length - 1) { currentIndex++; renderQuestion(); }
            });
            document.getElementById("questionNavigation").addEventListener("click", event => {
                const button = event.target.closest("[data-question-index]");
                if (button) { currentIndex = Number(button.dataset.questionIndex); renderQuestion(); }
            });
            document.getElementById("testQuestion").addEventListener("change", event => {
                if (event.target.name === "test-answer") {
                    answers[currentIndex] = Number(event.target.value);
                    renderNavigation();
                }
            });
            document.getElementById("markForReview").addEventListener("click", () => {
                reviewFlags[currentIndex] = !reviewFlags[currentIndex];
                renderQuestion();
            });
            document.getElementById("submitPracticeTest").addEventListener("click", submitTest);
            document.getElementById("externalScoreForm").addEventListener("submit", saveExternalScores);
        } catch (error) {
            showMessage("practiceBuilderMessage", error.message, true);
            console.error(error);
        }
    }

    document.addEventListener("DOMContentLoaded", init);
}());
