/* Quiz setup, grading, explanations, and ACT progress updates. */
(function () {
    "use strict";

    let activeQuestions = [];
    let submitted = false;

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[character]);
    }

    function showMessage(message, isError = false) {
        const element = document.getElementById("quizBuilderMessage");
        element.textContent = message;
        element.classList.toggle("error", isError);
    }

    function matchingQuestions() {
        const subject = document.getElementById("quizSubject").value;
        const skill = document.getElementById("quizSkill").value;
        const difficulty = document.getElementById("quizDifficulty").value;
        return ACTQuestionBank.filter(question =>
            question.subject === subject &&
            (skill === "all" || question.skill === skill) &&
            (difficulty === "all" || question.difficulty === difficulty)
        );
    }

    function syncSkills() {
        const subject = document.getElementById("quizSubject").value;
        const current = document.getElementById("quizSkill").value;
        const skills = [...new Set(ACTQuestionBank
            .filter(question => question.subject === subject)
            .map(question => question.skill))];
        document.getElementById("quizSkill").innerHTML =
            `<option value="all">All available skills</option>` +
            skills.map(skill => `<option>${escapeHTML(skill)}</option>`).join("");
        if (skills.includes(current)) document.getElementById("quizSkill").value = current;
        updateAvailableCount();
    }

    function updateAvailableCount() {
        const available = matchingQuestions().length;
        const count = document.getElementById("questionCount");
        count.max = Math.min(10, available);
        if (Number(count.value) > Number(count.max)) count.value = count.max || 1;
        showMessage(`${available} original question${available === 1 ? "" : "s"} available for this selection.`);
    }

    function shuffle(items) {
        const result = [...items];
        for (let index = result.length - 1; index > 0; index--) {
            const other = Math.floor(Math.random() * (index + 1));
            [result[index], result[other]] = [result[other], result[index]];
        }
        return result;
    }

    function renderQuestions() {
        const container = document.getElementById("quizQuestions");
        container.innerHTML = activeQuestions.map((question, index) => `
            <fieldset class="quiz-question" id="quizQuestion${index}">
                <legend class="sr-only">Question ${index + 1}</legend>
                <div class="quiz-question-top"><span>${escapeHTML(question.subject)}</span><span>${escapeHTML(question.difficulty)}</span>${escapeHTML(question.skill)}</div>
                <h3>${index + 1}. ${escapeHTML(question.prompt)}</h3>
                <div class="quiz-options">
                    ${question.options.map((option, optionIndex) => `
                        <label class="quiz-option">
                            <input type="radio" name="question-${index}" value="${optionIndex}">
                            <span>${String.fromCharCode(65 + optionIndex)}. ${escapeHTML(option)}</span>
                        </label>`).join("")}
                </div>
            </fieldset>`).join("");
    }

    function generateQuiz(event) {
        event.preventDefault();
        const available = matchingQuestions();
        const count = Number(document.getElementById("questionCount").value);
        if (!available.length) {
            showMessage("No questions match those filters yet. Try another skill or difficulty.", true);
            return;
        }
        if (!Number.isInteger(count) || count < 1 || count > available.length || count > 10) {
            showMessage(`Choose between 1 and ${Math.min(10, available.length)} questions.`, true);
            return;
        }

        activeQuestions = shuffle(available).slice(0, count);
        submitted = false;
        document.getElementById("quizWorkspace").hidden = false;
        document.getElementById("quizResults").hidden = true;
        document.getElementById("quizSubmitRow").hidden = false;
        const subject = document.getElementById("quizSubject").value;
        const skill = document.getElementById("quizSkill").value;
        const difficulty = document.getElementById("quizDifficulty").value;
        document.getElementById("quizMeta").textContent =
            `${subject} · ${skill === "all" ? "Mixed available skills" : skill} · ${difficulty === "all" ? "Mixed difficulty" : difficulty}`;
        document.getElementById("quizQuestionCount").textContent = `${count} questions`;
        renderQuestions();
        showMessage("Quiz generated. Select an answer for each question, then submit.");
        document.getElementById("quizWorkspace").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function submitQuiz(event) {
        event.preventDefault();
        if (submitted || !activeQuestions.length) return;

        const formData = new FormData(event.currentTarget);
        const answers = activeQuestions.map((question, index) => {
            const selected = formData.get(`question-${index}`);
            return selected === null ? -1 : Number(selected);
        });
        const correctCount = answers.reduce((total, answer, index) =>
            total + (answer === activeQuestions[index].answer ? 1 : 0), 0);
        const perSkill = new Map();
        activeQuestions.forEach((question, index) => {
            const key = `${question.subject}\u0000${question.skill}`;
            const result = perSkill.get(key) || {
                subject: question.subject, skill: question.skill, correct: 0, total: 0
            };
            result.total++;
            if (answers[index] === question.answer) result.correct++;
            perSkill.set(key, result);
        });

        let session;
        try {
            const saved = ACTData.recordQuizSession({
                subject: document.getElementById("quizSubject").value,
                skill: document.getElementById("quizSkill").value === "all"
                    ? ""
                    : document.getElementById("quizSkill").value,
                difficulty: document.getElementById("quizDifficulty").value === "all"
                    ? "Mixed"
                    : document.getElementById("quizDifficulty").value,
                totalQuestions: activeQuestions.length,
                correctCount,
                skillResults: [...perSkill.values()]
            });
            session = saved.quizSessions.at(-1);
        } catch (error) {
            showMessage(error.message, true);
            return;
        }

        let reward = 0;
        let rewardError = "";
        try {
            reward = ACTData.awardCrystals(
                session.id,
                10 + correctCount * 5 + (correctCount === activeQuestions.length ? 25 : 0)
            );
        } catch (error) {
            rewardError = ` Your quiz was saved, but crystals could not be added: ${error.message}`;
        }

        submitted = true;
        activeQuestions.forEach((question, index) => {
            const correct = answers[index] === question.answer;
            const card = document.getElementById(`quizQuestion${index}`);
            card.classList.add(correct ? "answered-correct" : "answered-incorrect");
            card.querySelectorAll("input").forEach(input => { input.disabled = true; });
            card.insertAdjacentHTML("beforeend", `
                <div class="answer-explanation ${correct ? "" : "incorrect"}">
                    <strong>${correct ? "Correct" : "Review this one"} · Answer ${String.fromCharCode(65 + question.answer)}</strong>
                    <p>${escapeHTML(question.explanation)}</p>
                    ${!correct ? `<button class="act-button" type="button" data-save-question="${index}">Save to incorrect answers</button>` : ""}
                </div>`);
        });
        document.getElementById("quizSubmitRow").hidden = true;
        const percentage = Math.round(correctCount / activeQuestions.length * 100);
        const results = document.getElementById("quizResults");
        results.innerHTML = `
            <h3>${percentage}% — ${correctCount} of ${activeQuestions.length} correct</h3>
            <p>Your score and skill results have been saved and your ACT skill progress updated. ${rewardError || `You earned ${reward} crystals.`}</p>
            <div class="quiz-results-actions"><button class="act-button" type="button" id="newQuiz">Build another quiz</button></div>`;
        results.hidden = false;
        document.getElementById("newQuiz").addEventListener("click", () => {
            document.getElementById("quizWorkspace").hidden = true;
            document.getElementById("quizBuilderForm").scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    function saveMissedQuestion(index) {
        const question = activeQuestions[index];
        const selected = document.querySelector(`input[name="question-${index}"]:checked`);
        const originalAnswer = selected
            ? question.options[Number(selected.value)]
            : "No answer selected";
        try {
            ACTData.addIncorrectAnswer({
                subject: question.subject,
                skill: question.skill,
                question: question.prompt,
                originalAnswer,
                correctAnswer: question.options[question.answer],
                whyWrong: "Missed during a generated quiz.",
                explanation: question.explanation
            });
            const button = document.querySelector(`[data-save-question="${index}"]`);
            if (button) {
                button.textContent = "Saved to notebook";
                button.disabled = true;
            }
        } catch (error) {
            showMessage(error.message, true);
        }
    }

    function init() {
        try {
            ACTData.init();
            syncSkills();
            document.getElementById("quizSubject").addEventListener("change", syncSkills);
            document.getElementById("quizSkill").addEventListener("change", updateAvailableCount);
            document.getElementById("quizDifficulty").addEventListener("change", updateAvailableCount);
            document.getElementById("quizBuilderForm").addEventListener("submit", generateQuiz);
            document.getElementById("actQuizForm").addEventListener("submit", submitQuiz);
            document.getElementById("quizQuestions").addEventListener("click", event => {
                const button = event.target.closest("[data-save-question]");
                if (button) saveMissedQuestion(Number(button.dataset.saveQuestion));
            });
        } catch (error) {
            showMessage(error.message, true);
            console.error(error);
        }
    }

    document.addEventListener("DOMContentLoaded", init);
}());
