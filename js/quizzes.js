const QuizCenter = {
    currentSet: null,
    questions: [],
    questionIndex: 0,
    score: 0,
    answered: false,
    rewardGranted: false,
    crystalsPerCorrectAnswer: 50,
    completionBonus: 25,
    perfectScoreBonus: 100,

    init() {
        if (!window.StudyArchive) {
            console.error("StudyArchive could not be loaded.");
            return;
        }

        if (!Array.isArray(StudyArchive.data.quizSets)) {
            StudyArchive.data.quizSets = [];
        }

        document.getElementById("quizImportForm")
            .addEventListener("submit", event => this.importSet(event));

        document.getElementById("quizCreateForm")
            .addEventListener("submit", event => this.createSet(event));

        document.getElementById("addQuizQuestion")
            .addEventListener("click", () => this.addQuestionCard());

        document.getElementById("quizQuestionBuilder")
            .addEventListener("click", event => {
                const button = event.target.closest("[data-remove-question]");
                if (button && this.questionCardCount() > 2) {
                    const card = button.closest(".quiz-question-editor");
                    const preview = card.querySelector(".quiz-question-image-preview");
                    if (preview.src.startsWith("blob:")) URL.revokeObjectURL(preview.src);
                    card.remove();
                    this.updateQuestionCardControls();
                }
            });

        document.getElementById("quizQuestionBuilder")
            .addEventListener("change", event => {
                const input = event.target.closest(".quiz-question-image-input");
                if (!input?.files?.[0]) return;

                const preview = input.closest(".quiz-question-editor")
                    .querySelector(".quiz-question-image-preview");
                if (preview.src.startsWith("blob:")) {
                    URL.revokeObjectURL(preview.src);
                }
                preview.src = URL.createObjectURL(input.files[0]);
                preview.hidden = false;
            });

        document.getElementById("quizSetList")
            .addEventListener("click", event => this.handleSetAction(event));

        document.getElementById("nextQuestion")
            .addEventListener("click", () => this.nextQuestion());

        document.getElementById("quitQuiz")
            .addEventListener("click", () => this.closeQuiz());

        document.getElementById("retryQuiz")
            .addEventListener("click", () => {
                if (this.currentSet) this.startQuiz(this.currentSet.id);
            });

        this.addQuestionCard();
        this.addQuestionCard();
        this.renderSets();
    },

    questionCardCount() {
        return document.querySelectorAll(".quiz-question-editor").length;
    },

    addQuestionCard() {
        const container = document.getElementById("quizQuestionBuilder");
        const card = document.createElement("fieldset");
        card.className = "quiz-question-editor";

        const legend = document.createElement("legend");
        legend.textContent = `Question ${this.questionCardCount() + 1}`;

        const termLabel = document.createElement("label");
        termLabel.textContent = "Question or term";
        const term = document.createElement("input");
        term.type = "text";
        term.className = "quiz-question-term";
        term.maxLength = 300;
        term.placeholder = "e.g. What is photosynthesis?";
        term.required = true;
        termLabel.appendChild(term);

        const answerLabel = document.createElement("label");
        answerLabel.textContent = "Correct answer";
        const answer = document.createElement("input");
        answer.type = "text";
        answer.className = "quiz-question-answer";
        answer.maxLength = 500;
        answer.placeholder = "Write the answer";
        answer.required = true;
        answerLabel.appendChild(answer);

        const photoLabel = document.createElement("label");
        photoLabel.textContent = "Photo (optional)";
        const photo = document.createElement("input");
        photo.type = "file";
        photo.accept = "image/*";
        photo.className = "quiz-question-image-input";
        photoLabel.appendChild(photo);

        const preview = document.createElement("img");
        preview.className = "quiz-question-image-preview";
        preview.alt = "Question photo preview";
        preview.hidden = true;

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "quiz-remove-question";
        remove.dataset.removeQuestion = "";
        remove.textContent = "Remove question";

        card.append(legend, termLabel, answerLabel, photoLabel, preview, remove);
        container.appendChild(card);
        this.updateQuestionCardControls();
    },

    updateQuestionCardControls() {
        const cards = [...document.querySelectorAll(".quiz-question-editor")];
        cards.forEach((card, index) => {
            card.querySelector("legend").textContent = `Question ${index + 1}`;
            card.querySelector("[data-remove-question]").disabled = cards.length <= 2;
        });
    },

    async createSet(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const message = document.getElementById("quizCreateMessage");
        const name = document.getElementById("newQuizName").value.trim();
        const editors = [...document.querySelectorAll(".quiz-question-editor")];
        const cards = editors.map(editor => ({
            term: editor.querySelector(".quiz-question-term").value.trim(),
            definition: editor.querySelector(".quiz-question-answer").value.trim(),
            imageFile: editor.querySelector(".quiz-question-image-input").files[0] || null
        }));

        message.classList.remove("error");
        if (!name) {
            message.textContent = "Enter a name for your quiz.";
            document.getElementById("newQuizName").focus();
            return;
        }
        if (cards.some(card => !card.term || !card.definition)) {
            message.textContent = "Add both a question and answer to every card.";
            message.classList.add("error");
            return;
        }
        if (new Set(cards.map(card => card.definition.toLowerCase())).size < 2) {
            message.textContent = "Use at least two different answers so the quiz can be played.";
            message.classList.add("error");
            return;
        }

        try {
            const quizCards = await Promise.all(cards.map(async card => ({
                term: card.term,
                definition: card.definition,
                image: card.imageFile
                    ? await StudyArchive.imageToDataURL(card.imageFile)
                    : ""
            })));
            const studySet = {
                id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
                name,
                cards: quizCards,
                createdAt: new Date().toISOString()
            };

            StudyArchive.data.quizSets.unshift(studySet);
            try {
                StudyArchive.save();
            } catch (error) {
                StudyArchive.data.quizSets =
                    StudyArchive.data.quizSets.filter(item => item.id !== studySet.id);
                throw error;
            }

            document.querySelectorAll(".quiz-question-image-preview").forEach(preview => {
                if (preview.src.startsWith("blob:")) URL.revokeObjectURL(preview.src);
            });
            form.reset();
            document.getElementById("quizQuestionBuilder").replaceChildren();
            this.addQuestionCard();
            this.addQuestionCard();
            message.textContent = `Created "${name}" with ${quizCards.length} questions.`;
            this.renderSets();
        } catch (error) {
            message.textContent = error.message || "The quiz could not be saved.";
            message.classList.add("error");
        }
    },

    parseQuizletExport(text) {
        const lines = String(text ?? "")
            .replace(/\r\n?/g, "\n")
            .split("\n");
        const cards = [];

        lines.forEach((line, index) => {
            if (!line.trim()) return;

            const separator = line.indexOf("\t");
            if (separator < 0) {
                throw new Error(`Line ${index + 1} is missing the tab between term and definition.`);
            }

            const term = line.slice(0, separator).trim();
            const definition = line.slice(separator + 1).trim();
            if (!term || !definition) {
                throw new Error(`Line ${index + 1} needs both a term and a definition.`);
            }

            cards.push({ term, definition, image: "" });
        });

        if (!cards.length) {
            throw new Error("No cards found. Paste a Quizlet export with one term and definition per line.");
        }

        return cards;
    },

    importSet(event) {
        event.preventDefault();

        const nameInput = document.getElementById("quizSetName");
        const textInput = document.getElementById("quizImportText");
        const message = document.getElementById("quizImportMessage");
        const name = nameInput.value.trim();

        message.classList.remove("error");

        if (!name) {
            message.textContent = "Enter a name for this study set.";
            message.classList.add("error");
            nameInput.focus();
            return;
        }

        let cards;
        try {
            cards = this.parseQuizletExport(textInput.value);
        } catch (error) {
            message.textContent = error.message;
            message.classList.add("error");
            textInput.focus();
            return;
        }

        const studySet = {
            id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
            name,
            cards,
            importedAt: new Date().toISOString()
        };

        StudyArchive.data.quizSets.unshift(studySet);
        StudyArchive.save();
        event.target.reset();
        message.textContent = `Imported ${cards.length} ${cards.length === 1 ? "card" : "cards"}.`;
        this.renderSets();
    },

    handleSetAction(event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const setId = button.closest("[data-set-id]")?.dataset.setId;
        if (!setId) return;

        if (button.dataset.action === "start") {
            this.startQuiz(setId);
        } else if (button.dataset.action === "delete") {
            this.deleteSet(setId);
        }
    },

    renderSets() {
        const container = document.getElementById("quizSetList");
        const count = document.getElementById("quizSetCount");
        const sets = StudyArchive.data.quizSets;

        count.textContent = `${sets.length} ${sets.length === 1 ? "set" : "sets"}`;
        container.replaceChildren();

        if (!sets.length) {
            const empty = document.createElement("p");
            empty.className = "quiz-empty-library";
            empty.textContent = "Your imported study sets will appear here. Import a Quizlet export to get started.";
            container.appendChild(empty);
            return;
        }

        sets.forEach(studySet => {
            const article = document.createElement("article");
            article.className = "quiz-set-card";
            article.dataset.setId = studySet.id;

            const icon = document.createElement("span");
            icon.className = "quiz-set-card-icon";
            icon.innerHTML = '<i data-lucide="layers" aria-hidden="true"></i>';

            const info = document.createElement("div");
            info.className = "quiz-set-info";

            const title = document.createElement("h3");
            title.textContent = studySet.name;

            const details = document.createElement("p");
            details.textContent = `${studySet.cards.length} ${studySet.cards.length === 1 ? "card" : "cards"}`;

            info.append(title, details);

            const actions = document.createElement("div");
            actions.className = "quiz-set-actions";

            const start = document.createElement("button");
            start.type = "button";
            start.dataset.action = "start";
            start.textContent = "Take quiz";
            start.disabled = studySet.cards.length < 2;
            if (start.disabled) start.title = "Import at least two cards to take a quiz.";

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "quiz-delete-button";
            remove.dataset.action = "delete";
            remove.setAttribute("aria-label", `Delete ${studySet.name}`);
            remove.title = "Delete study set";
            remove.innerHTML = '<i data-lucide="trash-2" aria-hidden="true"></i>';

            actions.append(start, remove);
            article.append(icon, info, actions);
            container.appendChild(article);
        });

        window.lucide?.createIcons();
    },

    deleteSet(setId) {
        const studySet = StudyArchive.data.quizSets.find(item => item.id === setId);
        if (!studySet) return;

        if (!window.confirm(`Delete "${studySet.name}" and its cards?`)) return;

        StudyArchive.data.quizSets = StudyArchive.data.quizSets
            .filter(item => item.id !== setId);
        StudyArchive.save();
        this.renderSets();

        if (this.currentSet?.id === setId) this.closeQuiz();
    },

    startQuiz(setId) {
        const studySet = StudyArchive.data.quizSets.find(item => item.id === setId);
        if (!studySet) return;

        const uniqueAnswers = new Set(studySet.cards.map(card => card.definition));
        if (uniqueAnswers.size < 2) {
            window.alert("This set needs at least two different definitions to make a quiz.");
            return;
        }

        this.currentSet = studySet;
        this.questions = this.shuffle([...studySet.cards]);
        this.questionIndex = 0;
        this.score = 0;
        this.rewardGranted = false;

        document.getElementById("quizSession").hidden = false;
        document.getElementById("quizQuestionCard").hidden = false;
        document.getElementById("quizResults").hidden = true;
        this.renderQuestion();
        document.getElementById("quizSession")
            .scrollIntoView({ behavior: "smooth", block: "start" });
    },

    renderQuestion() {
        const card = this.questions[this.questionIndex];
        const options = this.shuffle([
            card,
            ...this.shuffle(this.questions.filter(item =>
                item !== card && item.definition !== card.definition
            )).slice(0, 3)
        ]);
        const answers = document.getElementById("quizAnswers");
        const total = this.questions.length;

        this.answered = false;
        document.getElementById("quizSessionTitle").textContent = this.currentSet.name;
        document.getElementById("quizProgressLabel").textContent =
            `QUESTION ${this.questionIndex + 1} OF ${total}`;
        document.getElementById("quizProgressFill").style.width =
            `${(this.questionIndex / total) * 100}%`;
        document.getElementById("quizTerm").textContent = card.term;
        const image = document.getElementById("quizQuestionImage");
        image.src = card.image || "";
        image.hidden = !card.image;
        document.getElementById("quizFeedback").textContent = "";
        document.getElementById("nextQuestion").hidden = true;
        document.getElementById("nextQuestion").textContent =
            this.questionIndex === total - 1 ? "See results" : "Next question";
        answers.replaceChildren();

        options.forEach(option => {
            const answer = document.createElement("button");
            answer.type = "button";
            answer.className = "quiz-answer-button";
            answer.textContent = option.definition;
            answer.addEventListener("click", () =>
                this.submitAnswer(option.definition, answer)
            );
            answers.appendChild(answer);
        });
    },

    submitAnswer(definition, selectedButton) {
        if (this.answered) return;

        this.answered = true;
        const correctDefinition = this.questions[this.questionIndex].definition;
        const isCorrect = definition === correctDefinition;
        if (isCorrect) this.score += 1;

        document.querySelectorAll(".quiz-answer-button").forEach(button => {
            button.disabled = true;
            if (button.textContent === correctDefinition) {
                button.classList.add("correct");
            }
        });

        if (!isCorrect) selectedButton.classList.add("incorrect");

        document.getElementById("quizFeedback").textContent = isCorrect
            ? "That's right."
            : `Not quite. The answer is: ${correctDefinition}`;
        document.getElementById("quizProgressFill").style.width =
            `${((this.questionIndex + 1) / this.questions.length) * 100}%`;
        document.getElementById("nextQuestion").hidden = false;
    },

    nextQuestion() {
        if (!this.answered) return;

        this.questionIndex += 1;
        if (this.questionIndex >= this.questions.length) {
            this.showResults();
            return;
        }

        this.renderQuestion();
    },

    showResults() {
        if (this.rewardGranted) return;

        const perfectScore = this.score === this.questions.length;
        const reward = this.score * this.crystalsPerCorrectAnswer +
            this.completionBonus +
            (perfectScore ? this.perfectScoreBonus : 0);

        StudyArchive.addCrystals(reward);
        this.rewardGranted = true;

        document.getElementById("quizQuestionCard").hidden = true;
        document.getElementById("quizResults").hidden = false;
        document.getElementById("quizProgressLabel").textContent = "QUIZ COMPLETE";
        document.getElementById("quizProgressFill").style.width = "100%";
        document.getElementById("quizScore").textContent =
            `${this.score} / ${this.questions.length} correct`;
        document.getElementById("quizReward").textContent =
            `You earned ${reward} crystals!`;

        const percentage = Math.round((this.score / this.questions.length) * 100);
        document.getElementById("quizResultMessage").textContent =
            percentage === 100
                ? "Perfect score. You know this set inside out."
                : percentage >= 70
                    ? "Nice work. A little more practice will make it stick."
                    : "Good start. Review the set and give it another try.";
    },

    closeQuiz() {
        document.getElementById("quizSession").hidden = true;
        this.currentSet = null;
        this.questions = [];
    },

    shuffle(items) {
        for (let index = items.length - 1; index > 0; index -= 1) {
            const otherIndex = Math.floor(Math.random() * (index + 1));
            [items[index], items[otherIndex]] = [items[otherIndex], items[index]];
        }

        return items;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    if (window.StudyArchive) {
        QuizCenter.init();
    }
});
