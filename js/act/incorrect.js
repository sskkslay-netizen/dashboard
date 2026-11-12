/* Incorrect-answer notebook and missed-question practice. */
(function () {
    "use strict";

    let practiceItems = [];
    let practiceIndex = 0;

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

    function syncSkills() {
        const subject = document.getElementById("incorrectSubject").value;
        const select = document.getElementById("incorrectSkill");
        const skills = ACTData.SUBJECTS[subject] || [];
        select.innerHTML = skills.length
            ? `<option value="">Choose a skill</option>${skills.map(skill => `<option>${escapeHTML(skill)}</option>`).join("")}`
            : '<option value="">Choose subject first</option>';
        select.disabled = !skills.length;
    }

    function filteredEntries(data) {
        const search = document.getElementById("incorrectSearch").value.trim().toLowerCase();
        const subject = document.getElementById("incorrectSubjectFilter").value;
        const status = document.getElementById("incorrectStatusFilter").value;
        return data.incorrectAnswers.filter(entry => {
            if (subject !== "all" && entry.subject !== subject) return false;
            if (status === "reviewed" && !entry.reviewed) return false;
            if (status === "unreviewed" && entry.reviewed) return false;
            return [entry.subject, entry.skill, entry.question, entry.originalAnswer,
                entry.correctAnswer, entry.whyWrong, entry.explanation]
                .join(" ").toLowerCase().includes(search);
        });
    }

    function render(data) {
        const entries = filteredEntries(data);
        document.getElementById("incorrectCount").textContent =
            `${entries.length} ${entries.length === 1 ? "question" : "questions"}`;
        const container = document.getElementById("incorrectList");
        if (!entries.length) {
            container.innerHTML = '<div class="incorrect-empty">No saved questions match this view. Add a missed question below to start your notebook.</div>';
            return;
        }

        container.innerHTML = entries.map(entry => `
            <article class="incorrect-card">
                <div class="incorrect-card-top">
                    <span class="incorrect-subject">${escapeHTML(entry.subject)}</span>
                    <span class="incorrect-status ${entry.reviewed ? "reviewed" : ""}">${entry.reviewed ? "Reviewed" : "To review"}</span>
                </div>
                <span class="incorrect-skill">${escapeHTML(entry.skill)}</span>
                <h3>${escapeHTML(entry.question)}</h3>
                <div class="incorrect-card-detail"><strong>Your answer</strong><p>${escapeHTML(entry.originalAnswer)}</p></div>
                <div class="incorrect-card-detail"><strong>Correct answer</strong><p>${escapeHTML(entry.correctAnswer)}</p></div>
                ${entry.whyWrong ? `<div class="incorrect-card-detail"><strong>Why it was missed</strong><p>${escapeHTML(entry.whyWrong)}</p></div>` : ""}
                <div class="incorrect-card-detail"><strong>Explanation</strong><p>${escapeHTML(entry.explanation)}</p></div>
                <div class="incorrect-card-actions">
                    <button class="act-button" type="button" data-review-id="${escapeHTML(entry.id)}" data-reviewed="${!entry.reviewed}">
                        Mark ${entry.reviewed ? "not reviewed" : "reviewed"}
                    </button>
                    <button class="act-button act-button-primary" type="button" data-practice-id="${escapeHTML(entry.id)}">Practice this question</button>
                </div>
            </article>`).join("");
    }

    function renderPractice() {
        const panel = document.getElementById("incorrectPractice");
        const entry = practiceItems[practiceIndex];
        if (!entry) {
            panel.hidden = true;
            return;
        }
        panel.hidden = false;
        document.getElementById("practicePosition").textContent =
            `Question ${practiceIndex + 1} of ${practiceItems.length} · ${entry.subject} · ${entry.skill}`;
        document.getElementById("practiceCard").innerHTML = `
            <p class="practice-question">${escapeHTML(entry.question)}</p>
            <label for="practiceAnswer">Your answer
                <input class="act-form-control practice-answer-input" id="practiceAnswer" type="text" autocomplete="off">
            </label>
            <div id="practiceFeedback"></div>`;
        document.getElementById("practicePrevious").disabled = practiceIndex === 0;
        document.getElementById("practiceNext").textContent =
            practiceIndex === practiceItems.length - 1 ? "Finish practice" : "Next question";
        showMessage("practiceMessage", "");
    }

    function checkPracticeAnswer() {
        const entry = practiceItems[practiceIndex];
        if (!entry) return;
        const answer = document.getElementById("practiceAnswer").value.trim();
        if (!answer) {
            showMessage("practiceMessage", "Enter an answer before checking it.", true);
            return;
        }
        const isCorrect = answer.toLowerCase() === entry.correctAnswer.trim().toLowerCase();
        document.getElementById("practiceFeedback").innerHTML = `
            <div class="practice-feedback ${isCorrect ? "" : "incorrect"}">
                <strong>${isCorrect ? "That’s right." : "Not quite."}</strong>
                <p>Correct answer: ${escapeHTML(entry.correctAnswer)}</p>
                <p>${escapeHTML(entry.explanation)}</p>
            </div>`;
        try {
            ACTData.setIncorrectReviewed(entry.id, true);
        } catch (error) {
            showMessage("practiceMessage", error.message, true);
        }
    }

    function startPractice(entries) {
        if (!entries.length) {
            showMessage("incorrectMessage", "Add or select a saved question before starting practice.", true);
            return;
        }
        practiceItems = [...entries].sort((a, b) => Number(a.reviewed) - Number(b.reviewed));
        practiceIndex = 0;
        renderPractice();
        document.getElementById("incorrectPractice").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function init() {
        try {
            ACTData.init();
            const refresh = () => render(ACTData.getState());
            ACTData.subscribe(refresh);
            refresh();
            ["incorrectSearch", "incorrectSubjectFilter", "incorrectStatusFilter"].forEach(id => {
                document.getElementById(id).addEventListener("input", refresh);
                document.getElementById(id).addEventListener("change", refresh);
            });
            document.getElementById("incorrectSubject").addEventListener("change", syncSkills);
            document.getElementById("startIncorrectPractice").addEventListener("click", () => {
                startPractice(filteredEntries(ACTData.getState()));
            });
            document.getElementById("closeIncorrectPractice").addEventListener("click", () => {
                document.getElementById("incorrectPractice").hidden = true;
            });
            document.getElementById("checkPracticeAnswer").addEventListener("click", checkPracticeAnswer);
            document.getElementById("practicePrevious").addEventListener("click", () => {
                if (practiceIndex > 0) { practiceIndex--; renderPractice(); }
            });
            document.getElementById("practiceNext").addEventListener("click", () => {
                if (practiceIndex < practiceItems.length - 1) {
                    practiceIndex++;
                    renderPractice();
                } else {
                    document.getElementById("incorrectPractice").hidden = true;
                    showMessage("incorrectMessage", "Practice session finished.");
                }
            });
            document.getElementById("incorrectList").addEventListener("click", event => {
                const reviewButton = event.target.closest("[data-review-id]");
                const practiceButton = event.target.closest("[data-practice-id]");
                try {
                    if (reviewButton) {
                        ACTData.setIncorrectReviewed(reviewButton.dataset.reviewId, reviewButton.dataset.reviewed === "true");
                    } else if (practiceButton) {
                        const entry = ACTData.getState().incorrectAnswers.find(item => item.id === practiceButton.dataset.practiceId);
                        if (entry) startPractice([entry]);
                    }
                } catch (error) {
                    showMessage("incorrectMessage", error.message, true);
                }
            });
            document.getElementById("incorrectForm").addEventListener("submit", event => {
                event.preventDefault();
                const values = new FormData(event.currentTarget);
                try {
                    ACTData.addIncorrectAnswer({
                        subject: values.get("subject"),
                        skill: values.get("skill"),
                        question: values.get("question"),
                        originalAnswer: values.get("originalAnswer"),
                        correctAnswer: values.get("correctAnswer"),
                        whyWrong: values.get("whyWrong"),
                        explanation: values.get("explanation")
                    });
                    event.currentTarget.reset();
                    syncSkills();
                    showMessage("incorrectMessage", "Question saved to your notebook.");
                } catch (error) {
                    showMessage("incorrectMessage", error.message, true);
                }
            });
        } catch (error) {
            showMessage("incorrectMessage", error.message, true);
            console.error(error);
        }
    }

    document.addEventListener("DOMContentLoaded", init);
}());
