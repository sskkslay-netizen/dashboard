const QuizCenter = {
    currentSet: null,
    questions: [],
    questionIndex: 0,
    score: 0,
    points: 0,
    streak: 0,
    answered: false,
    rewardGranted: false,
    mode: "quiz",
    timerInterval: null,
    timeLeft: 15,
    flashcardIndex: 0,
    flashcardStates: [],
    flashcardFlipped: false,
    writtenAttempts: 0,
    matchTiles: [],
    matchSelection: [],
    matchMoves: 0,
    matchElapsed: 0,
    matchLocked: false,
    matchTimeout: null,
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
        document.getElementById("quizSearch")
            .addEventListener("input", () => this.renderSets());
        document.getElementById("quizWrittenAnswerForm")
            .addEventListener("submit", event => this.checkWrittenAnswer(event));

        document.getElementById("nextQuestion")
            .addEventListener("click", () => this.nextQuestion());

        document.getElementById("flashcard")
            .addEventListener("click", () => this.flipFlashcard());
        document.getElementById("flashcardPrevious")
            .addEventListener("click", () => this.moveFlashcard(-1));
        document.getElementById("flashcardNext")
            .addEventListener("click", () => this.moveFlashcard(1));
        document.getElementById("flashcardShuffle")
            .addEventListener("click", () => {
                this.questions = this.shuffle(this.questions);
                this.flashcardIndex = 0;
                this.renderFlashcard();
            });
        document.getElementById("flashcardReview")
            .addEventListener("click", () => this.markFlashcard("review"));
        document.getElementById("flashcardKnown")
            .addEventListener("click", () => this.markFlashcard("known"));
        document.getElementById("matchBoard")
            .addEventListener("click", event => this.selectMatchTile(event));

        document.getElementById("quitQuiz")
            .addEventListener("click", () => this.closeQuiz());

        document.getElementById("retryQuiz")
            .addEventListener("click", () => {
                if (this.currentSet) this.startQuiz(this.currentSet.id, this.mode);
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

        if (button.dataset.action === "study") {
            this.startQuiz(setId, "flashcards");
        } else if (button.dataset.action === "write") {
            this.startQuiz(setId, "write");
        } else if (button.dataset.action === "start") {
            this.startQuiz(setId, "quiz");
        } else if (button.dataset.action === "blitz") {
            this.startQuiz(setId, "blitz");
        } else if (button.dataset.action === "match") {
            this.startQuiz(setId, "match");
        } else if (button.dataset.action === "delete") {
            this.deleteSet(setId);
        }
    },

    renderSets() {
        const container = document.getElementById("quizSetList");
        const count = document.getElementById("quizSetCount");
        const allSets = StudyArchive.data.quizSets;
        const query = document.getElementById("quizSearch").value.trim().toLocaleLowerCase();
        const sets = allSets.filter(studySet =>
            !query || `${studySet.name} ${studySet.cards.map(card =>
                `${card.term} ${card.definition}`
            ).join(" ")}`.toLocaleLowerCase().includes(query)
        );

        count.textContent = query
            ? `${sets.length} of ${allSets.length} sets`
            : `${sets.length} ${sets.length === 1 ? "set" : "sets"}`;
        container.replaceChildren();

        if (!allSets.length) {
            const empty = document.createElement("p");
            empty.className = "quiz-empty-library";
            empty.textContent = "Your study sets will appear here. Import a set or create your own to get started.";
            container.appendChild(empty);
            return;
        }
        if (!sets.length) {
            const empty = document.createElement("p");
            empty.className = "quiz-empty-library";
            empty.textContent = "No sets match your search. Try a different title, term, or definition.";
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
            details.textContent = `${studySet.cards.length} ${studySet.cards.length === 1 ? "card" : "cards"} · Cards, write, quiz, timed & match`;

            info.append(title, details);

            const actions = document.createElement("div");
            actions.className = "quiz-set-actions";

            const study = document.createElement("button");
            study.type = "button";
            study.dataset.action = "study";
            study.textContent = "Study cards";
            study.disabled = studySet.cards.length === 0;

            const write = document.createElement("button");
            write.type = "button";
            write.dataset.action = "write";
            write.textContent = "Write";
            write.disabled = studySet.cards.length === 0;

            const start = document.createElement("button");
            start.type = "button";
            start.dataset.action = "start";
            start.textContent = "Quiz";
            start.disabled = studySet.cards.length < 2;
            if (start.disabled) start.title = "Import at least two cards to take a quiz.";

            const blitz = document.createElement("button");
            blitz.type = "button";
            blitz.dataset.action = "blitz";
            blitz.textContent = "Timed";
            blitz.disabled = studySet.cards.length < 2;
            if (blitz.disabled) blitz.title = "Add at least two cards to play a timed challenge.";

            const match = document.createElement("button");
            match.type = "button";
            match.dataset.action = "match";
            match.textContent = "Match";
            match.disabled = this.getMatchCards(studySet.cards).length < 2;
            if (match.disabled) match.title = "Add at least two cards with different terms and definitions.";

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "quiz-delete-button";
            remove.dataset.action = "delete";
            remove.setAttribute("aria-label", `Delete ${studySet.name}`);
            remove.title = "Delete study set";
            remove.innerHTML = '<i data-lucide="trash-2" aria-hidden="true"></i>';

            actions.append(study, write, start, blitz, match, remove);
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

    getMatchCards(cards) {
        const terms = new Set();
        const definitions = new Set();
        return cards.filter(card => {
            if (terms.has(card.term) || definitions.has(card.definition)) return false;
            terms.add(card.term);
            definitions.add(card.definition);
            return true;
        });
    },

    startQuiz(setId, mode = "quiz") {
        const studySet = StudyArchive.data.quizSets.find(item => item.id === setId);
        if (!studySet) return;

        const shuffledCards = this.shuffle([...studySet.cards]);
        this.questions = mode === "match"
            ? this.getMatchCards(shuffledCards).slice(0, 6)
            : shuffledCards;
        const uniqueAnswers = new Set(this.questions.map(card => card.definition));
        if (mode === "match" && this.questions.length < 2) {
            window.alert("Matching needs at least two cards with different terms and definitions.");
            return;
        }
        if (["quiz", "blitz"].includes(mode) && uniqueAnswers.size < 2) {
            window.alert("This set needs at least two different definitions to make a quiz.");
            return;
        }

        this.currentSet = studySet;
        this.questionIndex = 0;
        this.score = 0;
        this.points = 0;
        this.streak = 0;
        this.rewardGranted = false;
        this.mode = mode;
        this.flashcardIndex = 0;
        this.flashcardFlipped = false;
        this.flashcardStates = this.questions.map(() => null);
        this.writtenAttempts = 0;
        this.clearTimer();
        this.clearMatchTimeout();
        this.matchSelection = [];
        this.matchMoves = 0;
        this.matchElapsed = 0;
        this.matchLocked = false;

        document.getElementById("quizSession").hidden = false;
        document.getElementById("quizQuestionCard").hidden =
            !["quiz", "write", "blitz"].includes(mode);
        document.getElementById("flashcardStudy").hidden = mode !== "flashcards";
        document.getElementById("matchGame").hidden = mode !== "match";
        document.getElementById("quizResults").hidden = true;
        document.getElementById("quizSessionEyebrow").textContent =
            mode === "flashcards" ? "FLASHCARD STUDY" :
                mode === "blitz" ? "TIMED CHALLENGE" :
                    mode === "write" ? "WRITTEN PRACTICE" :
                        mode === "match" ? "MATCH GAME" : "PRACTICE QUIZ";
        if (mode === "flashcards") this.renderFlashcard();
        else if (mode === "match") this.renderMatchGame();
        else this.renderQuestion();
        document.getElementById("quizSession")
            .scrollIntoView({ behavior: "smooth", block: "start" });
    },

    renderFlashcard() {
        const card = this.questions[this.flashcardIndex];
        const image = document.getElementById("flashcardImage");
        const state = this.flashcardStates[this.flashcardIndex];
        document.getElementById("quizSessionTitle").textContent = this.currentSet.name;
        document.getElementById("quizProgressLabel").textContent =
            `CARD ${this.flashcardIndex + 1} OF ${this.questions.length}`;
        document.getElementById("quizProgressFill").style.width =
            `${((this.flashcardIndex + 1) / this.questions.length) * 100}%`;
        document.getElementById("flashcardSide").textContent =
            this.flashcardFlipped ? "DEFINITION" : "TERM";
        document.getElementById("flashcardText").textContent =
            this.flashcardFlipped ? card.definition : card.term;
        image.src = card.image || "";
        image.hidden = !card.image;
        document.getElementById("flashcardStatus").textContent = state
            ? state === "known" ? "You know this one" : "Needs more practice"
            : "Not marked yet";
        document.getElementById("flashcardStatus").dataset.state = state || "";
        const known = this.flashcardStates.filter(item => item === "known").length;
        const review = this.flashcardStates.filter(item => item === "review").length;
        document.getElementById("flashcardSummary").textContent =
            `${known} known · ${review} to review · ${this.questions.length - known - review} unmarked`;
        document.getElementById("flashcardPrevious").disabled = this.flashcardIndex === 0;
        document.getElementById("flashcardNext").disabled =
            this.flashcardIndex === this.questions.length - 1;
    },

    flipFlashcard() {
        this.flashcardFlipped = !this.flashcardFlipped;
        this.renderFlashcard();
    },

    moveFlashcard(direction) {
        const nextIndex = this.flashcardIndex + direction;
        if (nextIndex < 0 || nextIndex >= this.questions.length) return;
        this.flashcardIndex = nextIndex;
        this.flashcardFlipped = false;
        this.renderFlashcard();
    },

    markFlashcard(state) {
        this.flashcardStates[this.flashcardIndex] = state;
        const nextUnmarked = this.flashcardStates.findIndex(item => item === null);
        if (nextUnmarked >= 0) {
            this.flashcardIndex = nextUnmarked;
            this.flashcardFlipped = false;
        }
        this.renderFlashcard();
    },

    renderMatchGame() {
        const board = document.getElementById("matchBoard");
        this.matchTiles = this.shuffle(this.questions.flatMap((card, pairIndex) => [
            { pairIndex, side: "term", label: card.term, matched: false },
            { pairIndex, side: "definition", label: card.definition, matched: false }
        ]));
        board.replaceChildren();
        this.matchTiles.forEach((tile, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "match-tile";
            button.dataset.matchIndex = String(index);
            button.setAttribute("aria-label", `Hidden match card ${index + 1}`);
            button.textContent = "Reveal card";
            board.appendChild(button);
        });
        this.updateMatchStats();
        document.getElementById("quizProgressLabel").textContent =
            `0 OF ${this.questions.length} PAIRS MATCHED`;
        document.getElementById("quizProgressFill").style.width = "0%";
        this.timerInterval = window.setInterval(() => {
            this.matchElapsed += 1;
            this.updateMatchStats();
        }, 1000);
    },

    selectMatchTile(event) {
        const button = event.target.closest("button[data-match-index]");
        if (!button || this.matchLocked || button.disabled) return;
        const index = Number(button.dataset.matchIndex);
        const tile = this.matchTiles[index];
        if (!tile || tile.matched || this.matchSelection.includes(index)) return;

        button.classList.add("revealed");
        button.textContent = tile.label;
        button.setAttribute("aria-label", `${tile.side}: ${tile.label}`);
        this.matchSelection.push(index);
        if (this.matchSelection.length < 2) return;

        this.matchMoves += 1;
        const [firstIndex, secondIndex] = this.matchSelection;
        const first = this.matchTiles[firstIndex];
        const second = this.matchTiles[secondIndex];
        if (first.pairIndex === second.pairIndex) {
            first.matched = true;
            second.matched = true;
            this.score += 1;
            [firstIndex, secondIndex].forEach(tileIndex => {
                const matchedButton = document.querySelector(
                    `#matchBoard [data-match-index="${tileIndex}"]`
                );
                matchedButton.classList.add("matched");
                matchedButton.disabled = true;
                matchedButton.setAttribute("aria-label", "Matched");
            });
            this.matchSelection = [];
            this.updateMatchStats();
            if (this.score === this.questions.length) {
                this.clearTimer();
                this.showResults();
            }
            return;
        }

        this.matchLocked = true;
        [firstIndex, secondIndex].forEach(tileIndex => {
            document.querySelector(`#matchBoard [data-match-index="${tileIndex}"]`)
                .classList.add("mismatch");
        });
        this.updateMatchStats();
        this.matchTimeout = window.setTimeout(() => {
            [firstIndex, secondIndex].forEach(tileIndex => {
                const mismatchedButton = document.querySelector(
                    `#matchBoard [data-match-index="${tileIndex}"]`
                );
                mismatchedButton.classList.remove("revealed", "mismatch");
                mismatchedButton.textContent = "Reveal card";
                mismatchedButton.setAttribute("aria-label", `Hidden match card ${tileIndex + 1}`);
            });
            this.matchSelection = [];
            this.matchLocked = false;
            this.matchTimeout = null;
        }, 750);
    },

    updateMatchStats() {
        const formattedTime = this.formatMatchTime();
        document.getElementById("matchMoveCount").textContent =
            `${this.matchMoves} ${this.matchMoves === 1 ? "move" : "moves"}`;
        document.getElementById("matchElapsedTime").textContent = formattedTime;
        document.getElementById("matchPairsFound").textContent =
            `${this.score} / ${this.questions.length} pairs`;
        document.getElementById("quizProgressLabel").textContent =
            `${this.score} OF ${this.questions.length} PAIRS MATCHED`;
        document.getElementById("quizProgressFill").style.width =
            `${(this.score / this.questions.length) * 100}%`;
    },

    formatMatchTime() {
        const minutes = Math.floor(this.matchElapsed / 60);
        const seconds = String(this.matchElapsed % 60).padStart(2, "0");
        return `${minutes}:${seconds}`;
    },

    clearMatchTimeout() {
        if (this.matchTimeout !== null) {
            window.clearTimeout(this.matchTimeout);
            this.matchTimeout = null;
        }
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
        this.clearTimer();
        this.writtenAttempts = 0;
        document.getElementById("quizSessionTitle").textContent = this.currentSet.name;
        document.getElementById("quizProgressLabel").textContent =
            `QUESTION ${this.questionIndex + 1} OF ${total}`;
        document.getElementById("quizProgressFill").style.width =
            `${(this.questionIndex / total) * 100}%`;
        document.getElementById("quizBlitzStats").hidden = this.mode !== "blitz";
        if (this.mode === "blitz") {
            this.timeLeft = 15;
            document.getElementById("quizTimer").textContent = `${this.timeLeft}s`;
            document.getElementById("quizPoints").textContent = `${this.points} pts`;
            document.getElementById("quizStreak").textContent = `${this.streak} streak`;
            this.timerInterval = window.setInterval(() => {
                this.timeLeft -= 1;
                document.getElementById("quizTimer").textContent = `${this.timeLeft}s`;
                if (this.timeLeft <= 0) this.submitAnswer(null, null);
            }, 1000);
        }
        document.getElementById("quizTerm").textContent = card.term;
        document.getElementById("quizQuestionLabel").textContent =
            this.mode === "write" ? "Type the definition" : "What does this term mean?";
        const image = document.getElementById("quizQuestionImage");
        image.src = card.image || "";
        image.hidden = !card.image;
        document.getElementById("quizFeedback").textContent = "";
        document.getElementById("quizAnswers").hidden = this.mode === "write";
        document.getElementById("quizWrittenAnswerForm").hidden = this.mode !== "write";
        document.getElementById("quizWrittenInput").value = "";
        document.getElementById("quizWrittenInput").disabled = false;
        document.getElementById("checkWrittenAnswer").textContent = "Check answer";
        document.getElementById("checkWrittenAnswer").disabled = false;
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
        if (this.mode === "write") document.getElementById("quizWrittenInput").focus();
    },

    checkWrittenAnswer(event) {
        event.preventDefault();
        if (this.answered) return;

        const input = document.getElementById("quizWrittenInput");
        const normalize = value => String(value).normalize("NFKC")
            .trim()
            .toLocaleLowerCase()
            .replace(/\s+/g, " ")
            .replace(/[.!?;:,]+$/g, "");
        const correctDefinition = this.questions[this.questionIndex].definition;
        if (normalize(input.value) === normalize(correctDefinition)) {
            this.submitAnswer(correctDefinition, null);
            return;
        }

        this.writtenAttempts += 1;
        if (this.writtenAttempts < 2) {
            document.getElementById("quizFeedback").textContent =
                "Not quite. Check your spelling and try once more.";
            input.focus();
            input.select();
            document.getElementById("checkWrittenAnswer").textContent = "Try again";
            return;
        }
        this.submitAnswer(null, null);
    },

    submitAnswer(definition, selectedButton) {
        if (this.answered) return;

        this.answered = true;
        this.clearTimer();
        const correctDefinition = this.questions[this.questionIndex].definition;
        const isCorrect = definition === correctDefinition;
        if (isCorrect) {
            this.score += 1;
            this.streak += 1;
            if (this.mode === "blitz") {
                this.points += 500 + this.timeLeft * 50 + Math.min(this.streak, 10) * 25;
            }
        } else {
            this.streak = 0;
        }

        document.querySelectorAll(".quiz-answer-button").forEach(button => {
            button.disabled = true;
            if (button.textContent === correctDefinition) {
                button.classList.add("correct");
            }
        });

        if (!isCorrect && selectedButton) selectedButton.classList.add("incorrect");
        if (this.mode === "write") {
            document.getElementById("quizWrittenInput").disabled = true;
            document.getElementById("checkWrittenAnswer").disabled = true;
        }

        document.getElementById("quizFeedback").textContent = isCorrect
            ? this.mode === "blitz" ? `Correct! +${500 + this.timeLeft * 50 + Math.min(this.streak, 10) * 25} points` : "That's right."
            : definition === null && this.mode === "blitz" ? `Time's up! The answer is: ${correctDefinition}`
                : `Not quite. The answer is: ${correctDefinition}`;
        if (this.mode === "blitz") {
            document.getElementById("quizPoints").textContent = `${this.points} pts`;
            document.getElementById("quizStreak").textContent = `${this.streak} streak`;
        }
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
        this.clearTimer();

        document.getElementById("quizQuestionCard").hidden = true;
        document.getElementById("matchGame").hidden = true;
        document.getElementById("quizResults").hidden = false;
        document.getElementById("quizProgressLabel").textContent =
            this.mode === "match" ? "MATCH COMPLETE" : "QUIZ COMPLETE";
        if (this.mode === "match") {
            document.getElementById("quizResultsEyebrow").textContent = "MATCH GAME COMPLETE";
        } else {
            document.getElementById("quizResultsEyebrow").textContent = "PRACTICE COMPLETE";
        }
        document.getElementById("quizProgressFill").style.width = "100%";
        document.getElementById("quizScore").textContent =
            this.mode === "match"
                ? `${this.score} / ${this.questions.length} pairs · ${this.matchMoves} moves in ${this.formatMatchTime()}`
                : this.mode === "blitz"
                    ? `${this.score} / ${this.questions.length} correct · ${this.points} points`
                    : `${this.score} / ${this.questions.length} correct`;
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
        this.clearTimer();
        this.clearMatchTimeout();
        document.getElementById("quizSession").hidden = true;
        this.currentSet = null;
        this.questions = [];
    },

    clearTimer() {
        if (this.timerInterval !== null) {
            window.clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
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
