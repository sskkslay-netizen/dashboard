/* Shared data and localStorage helpers for the independent ACT study center. */
(function () {
    "use strict";

    const STORAGE_KEY = "studyArchiveACT";
    const SUBJECTS = {
        English: [
            "Grammar: Agreement",
            "Grammar: Comparisons and Descriptions",
            "Grammar: Conventional Expression",
            "Grammar: Modifiers",
            "Grammar: Parallelism",
            "Grammar: Pronouns",
            "Grammar: Punctuation",
            "Grammar: Sentence Structure",
            "Grammar: Verb Tense",
            "Rhetoric: Author Intent",
            "Rhetoric: Concision",
            "Rhetoric: Relevance",
            "Rhetoric: Structure and Organization",
            "Rhetoric: Tone",
            "Rhetoric: Transitions"
        ],
        Math: [
            "Algebra: Define and Interpret Linear Function",
            "Algebra: Exponential Functions",
            "Algebra: Inequalities",
            "Algebra: Integers",
            "Algebra: Manipulating Polynomials",
            "Algebra: Simplifying Exponents",
            "Algebra: Solving Single Variable Equations",
            "Algebra: Solving Systems of Linear Equations",
            "Coordinate Geometry: Lines and Slopes",
            "Coordinate Geometry: Nonlinear Functions",
            "Coordinate Geometry: Points",
            "Data: Categorical Data and Probabilities",
            "Data: Mean, Median, Mode, Standard Deviation",
            "Geometry: Circles",
            "Geometry: Lines and Angles",
            "Geometry: Polygons",
            "Geometry: Solid Geometry",
            "Geometry: Triangles",
            "Geometry: Trigonometry",
            "Function Notation",
            "Matrices",
            "Numbers: Sequences",
            "Rational and Irrational Numbers",
            "Rational Expressions",
            "Ratios and Proportions"
        ],
        Reading: [
            "Passage Overview",
            "Finding Key Details",
            "Inference",
            "Words and Phrases in Context",
            "Analyzing Text Structure and Purpose"
        ],
        Science: [
            "Basic Science",
            "Fact Finding",
            "Interpreting Trends",
            "Calculations",
            "Experimental Design",
            "Hypothetical Changes",
            "Interpreting Experiments",
            "Understanding Viewpoints",
            "Comparing Viewpoints"
        ]
    };

    const ADVANCED_SKILLS = new Set([
        "Grammar: Comparisons and Descriptions",
        "Grammar: Conventional Expression",
        "Grammar: Pronouns",
        "Grammar: Verb Tense",
        "Rhetoric: Author Intent",
        "Rhetoric: Tone",
        "Rhetoric: Transitions",
        "Algebra: Define and Interpret Linear Function",
        "Algebra: Exponential Functions",
        "Algebra: Inequalities",
        "Coordinate Geometry: Nonlinear Functions",
        "Geometry: Circles",
        "Function Notation",
        "Matrices",
        "Numbers: Sequences",
        "Rational Expressions",
        "Ratios and Proportions",
        "Finding Key Details",
        "Inference",
        "Words and Phrases in Context",
        "Analyzing Text Structure and Purpose",
        "Basic Science",
        "Experimental Design",
        "Understanding Viewpoints",
        "Comparing Viewpoints"
    ]);

    const LESSON_HISTORY = [
        { subject: "English", skill: "Rhetoric: Author Intent", date: "2026-11-08", score: 100, skillScore: 63 },
        { subject: "English", skill: "Rhetoric: Tone", date: "2026-11-06", score: 83, skillScore: 52 },
        { subject: "English", skill: "Rhetoric: Transitions", date: "2026-11-01", score: 100, skillScore: 63 },
        { subject: "Math", skill: "Matrices", date: "2026-11-06", score: 75, skillScore: 81 },
        { subject: "Math", skill: "Algebra: Inequalities", date: "2026-10-28", score: 66, skillScore: 75 },
        { subject: "Math", skill: "Numbers: Sequences", date: "2026-09-15", score: 100, skillScore: 100 },
        { subject: "Math", skill: "Geometry: Circles", date: "2026-08-09", score: 100, skillScore: 63 },
        { subject: "Reading", skill: "Finding Key Details", date: "2026-11-10", score: 100, skillScore: 63 },
        { subject: "Reading", skill: "Words and Phrases in Context", date: "2026-11-10", score: 100, skillScore: 63 },
        { subject: "Reading", skill: "Words and Phrases in Context", date: "2026-11-06", score: 50, skillScore: 31 },
        { subject: "Reading", skill: "Analyzing Text Structure and Purpose", date: "2026-09-16", score: 100, skillScore: 63 },
        { subject: "Reading", skill: "Inference", date: "2026-09-15", score: 100, skillScore: 63 },
        { subject: "Science", skill: "Interpreting Trends", date: "2026-11-07", score: 33, skillScore: 21 },
        { subject: "Science", skill: "Understanding Viewpoints", date: "2026-11-07", score: 100, skillScore: 63 },
        { subject: "Science", skill: "Hypothetical Changes", date: "2026-11-06", score: 66, skillScore: 42 },
        { subject: "Science", skill: "Experimental Design", date: "2026-09-18", score: 100, skillScore: 63 },
        { subject: "Science", skill: "Comparing Viewpoints", date: "2026-09-18", score: 83, skillScore: 52 },
        { subject: "Science", skill: "Basic Science", date: "2026-09-02", score: 100, skillScore: 63 }
    ];

    function skillId(subject, name) {
        return `${subject.toLowerCase()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    }

    function makeId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function skillLevel(score) {
        if (score >= 85) return "Mastery";
        if (score >= 40) return "Advanced";
        return "Core";
    }

    function getSkillLevel(skill) {
        return skill.manualLevel || (skill.score === 0
            ? skill.initialLevel || "Core"
            : skillLevel(skill.score));
    }

    function createInitialState() {
        const skills = {};

        Object.entries(SUBJECTS).forEach(([subject, names]) => {
            names.forEach(name => {
                const history = LESSON_HISTORY
                    .filter(item => item.subject === subject && item.skill === name)
                    .sort((a, b) => b.date.localeCompare(a.date));
                const score = history.length ? history[0].skillScore : 0;
                const id = skillId(subject, name);

                skills[id] = {
                    id,
                    subject,
                    name,
                    initialLevel: ADVANCED_SKILLS.has(name) ? "Advanced" : "Core",
                    score,
                    manualLevel: null
                };
            });
        });

        return {
            version: 1,
            totalStudyMinutes: 928,
            lessons: LESSON_HISTORY.map((lesson, index) => ({
                id: `sample-lesson-${index + 1}`,
                ...lesson,
                completed: true,
                source: "sample"
            })),
            skills,
            studySessions: [],
            quizResults: [],
            quizSessions: [],
            practiceTests: [],
            incorrectAnswers: [],
            strategies: [],
            bookmarks: [],
            crystalRewards: [],
            goals: {
                dailyMinutes: 30,
                dailyLessons: 1,
                weeklyLessons: 5
            }
        };
    }

    let state;
    const listeners = new Set();

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            throw new Error("ACT study data could not be saved in this browser.", { cause: error });
        }
        window.FirebaseSync?.save(STORAGE_KEY, state);
        listeners.forEach(listener => listener(clone(state)));
    }

    function update(mutator) {
        const nextState = clone(state);
        mutator(nextState);
        state = nextState;
        save();
        return getState();
    }

    function getState() {
        return clone(state);
    }

    function getCrystalBalance() {
        let saved;
        try {
            saved = localStorage.getItem("studyArchiveData");
        } catch (error) {
            throw new Error("Crystal balance could not be read from the Study Archive wallet.", { cause: error });
        }
        if (!saved) return 0;

        try {
            const wallet = JSON.parse(saved);
            if (!wallet || typeof wallet !== "object" || Array.isArray(wallet) ||
                !Number.isFinite(wallet.crystals) || wallet.crystals < 0) {
                throw new Error("The Study Archive crystal wallet has invalid data.");
            }
            return wallet.crystals;
        } catch (error) {
            throw new Error(`Crystal balance could not be loaded: ${error.message}`, { cause: error });
        }
    }

    function awardCrystals(activityId, amount) {
        if (typeof activityId !== "string" || !activityId.trim() ||
            !Number.isInteger(amount) || amount < 1) {
            throw new Error("A valid ACT activity and whole-number crystal reward are required.");
        }
        if (state.crystalRewards.some(reward => reward.id === activityId)) return 0;

        let wallet;
        let saved;
        try {
            saved = localStorage.getItem("studyArchiveData");
            wallet = saved ? JSON.parse(saved) : { crystals: 0, actCrystalRewards: [] };
            if (!wallet || typeof wallet !== "object" || Array.isArray(wallet) ||
                (wallet.crystals !== undefined &&
                    (!Number.isFinite(wallet.crystals) || wallet.crystals < 0))) {
                throw new Error("The Study Archive crystal wallet has invalid data.");
            }
            wallet.crystals = Number(wallet.crystals) || 0;
            wallet.actCrystalRewards = Array.isArray(wallet.actCrystalRewards)
                ? wallet.actCrystalRewards
                : [];
        } catch (error) {
            throw new Error(`ACT crystals could not be added: ${error.message}`, { cause: error });
        }

        const walletRewardId = `act:${activityId}`;
        const alreadyInWallet = wallet.actCrystalRewards.includes(walletRewardId);
        if (!alreadyInWallet) {
            wallet.crystals += amount;
            wallet.actCrystalRewards.push(walletRewardId);
            try {
                localStorage.setItem("studyArchiveData", JSON.stringify(wallet));
            } catch (error) {
                throw new Error("ACT crystals could not be saved to the Study Archive wallet.", { cause: error });
            }
            window.FirebaseSync?.save("studyArchiveData", wallet);
        }

        update(data => {
            data.crystalRewards.push({
                id: activityId,
                amount: alreadyInWallet ? 0 : amount,
                date: new Date().toISOString()
            });
        });
        return alreadyInWallet ? 0 : amount;
    }

    function recordStudyMinutes(minutes, note = "") {
        if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) {
            throw new RangeError("Study time must be between 1 and 1,440 whole minutes.");
        }

        return update(data => {
            data.totalStudyMinutes += minutes;
            data.studySessions.push({
                id: makeId("study"),
                date: new Date().toISOString(),
                minutes,
                note: String(note).trim()
            });
        });
    }

    function recordQuizSession(session) {
        if (!session || !Array.isArray(session.skillResults) || !session.skillResults.length) {
            throw new Error("Quiz results must include at least one practiced skill.");
        }
        if (!Number.isInteger(session.totalQuestions) || session.totalQuestions < 1 ||
            !Number.isInteger(session.correctCount) || session.correctCount < 0 ||
            session.correctCount > session.totalQuestions) {
            throw new RangeError("Quiz question totals are invalid.");
        }

        const date = new Date().toISOString();
        const id = makeId("quiz-session");
        return update(data => {
            data.quizSessions.push({
                id,
                date,
                subject: session.subject,
                skill: session.skill || "",
                difficulty: session.difficulty || "Mixed",
                totalQuestions: session.totalQuestions,
                correctCount: session.correctCount,
                score: Math.round(session.correctCount / session.totalQuestions * 100)
            });

            session.skillResults.forEach(result => {
                const idForSkill = skillId(result.subject, result.skill);
                const skill = data.skills[idForSkill];
                if (!skill || !Number.isInteger(result.total) || result.total < 1 ||
                    !Number.isInteger(result.correct) || result.correct < 0 ||
                    result.correct > result.total) {
                    throw new Error("A quiz result contains an invalid ACT skill or score.");
                }

                const score = Math.round(result.correct / result.total * 100);
                data.quizResults.push({
                    id: makeId("quiz-result"),
                    sessionId: id,
                    date,
                    subject: result.subject,
                    skill: result.skill,
                    correct: result.correct,
                    total: result.total,
                    score,
                    difficulty: session.difficulty || "Mixed"
                });
                skill.score = Math.round((skill.score + score) / 2);
                if (skill.manualLevel !== "Paused") skill.manualLevel = null;
            });
        });
    }

    function addIncorrectAnswer(entry) {
        if (!entry || !Object.hasOwn(SUBJECTS, entry.subject) ||
            !SUBJECTS[entry.subject].includes(entry.skill)) {
            throw new Error("Choose a valid ACT subject and skill.");
        }
        const question = String(entry.question || "").trim();
        const originalAnswer = String(entry.originalAnswer || "").trim();
        const correctAnswer = String(entry.correctAnswer || "").trim();
        const explanation = String(entry.explanation || "").trim();
        if (!question || !originalAnswer || !correctAnswer || !explanation) {
            throw new Error("Add the question, both answers, and a correct explanation.");
        }

        return update(data => {
            data.incorrectAnswers.unshift({
                id: makeId("incorrect"),
                subject: entry.subject,
                skill: entry.skill,
                question,
                originalAnswer,
                correctAnswer,
                whyWrong: String(entry.whyWrong || "").trim(),
                explanation,
                reviewed: false,
                createdAt: new Date().toISOString(),
                reviewedAt: null
            });
        });
    }

    function setIncorrectReviewed(id, reviewed) {
        if (typeof reviewed !== "boolean") {
            throw new Error("Choose whether the missed question has been reviewed.");
        }
        return update(data => {
            const entry = data.incorrectAnswers.find(item => item.id === id);
            if (!entry) throw new Error("The saved missed question could not be found.");
            entry.reviewed = reviewed;
            entry.reviewedAt = reviewed ? new Date().toISOString() : null;
        });
    }

    function removeIncorrectAnswer(id) {
        return update(data => {
            const index = data.incorrectAnswers.findIndex(item => item.id === id);
            if (index < 0) throw new Error("The saved missed question could not be found.");
            data.incorrectAnswers.splice(index, 1);
        });
    }

    function updateGoals(goals) {
        const values = {
            dailyMinutes: Number(goals.dailyMinutes),
            dailyLessons: Number(goals.dailyLessons),
            weeklyLessons: Number(goals.weeklyLessons)
        };
        if (!Number.isInteger(values.dailyMinutes) || values.dailyMinutes < 1 || values.dailyMinutes > 1440 ||
            !Number.isInteger(values.dailyLessons) || values.dailyLessons < 1 || values.dailyLessons > 20 ||
            !Number.isInteger(values.weeklyLessons) || values.weeklyLessons < 1 || values.weeklyLessons > 100) {
            throw new RangeError("Set goals within the allowed ranges shown in Settings.");
        }
        return update(data => {
            data.goals = { ...data.goals, ...values };
        });
    }

    function completeLesson(subject, skill, score, skillScore) {
        return update(data => {
            const id = skillId(subject, skill);
            if (!data.skills[id]) throw new Error("Choose a valid ACT skill before completing a lesson.");
            if (!Number.isFinite(score) || score < 0 || score > 100) {
                throw new RangeError("Lesson quiz score must be between 0 and 100.");
            }
            if (skillScore !== undefined &&
                (!Number.isFinite(skillScore) || skillScore < 0 || skillScore > 100)) {
                throw new RangeError("Skill score must be between 0 and 100.");
            }

            const previousScore = data.skills[id].score;
            const updatedScore = Math.round(skillScore === undefined
                ? (previousScore + score) / 2
                : skillScore);
            data.lessons.push({
                id: makeId("lesson"),
                subject,
                skill,
                date: new Date().toISOString().slice(0, 10),
                score,
                skillScore: updatedScore,
                completed: true,
                source: "lesson"
            });
            data.skills[id].score = updatedScore;
            if (data.skills[id].manualLevel !== "Paused") data.skills[id].manualLevel = null;
        });
    }

    function recordQuizResult(result) {
        return update(data => {
            const id = skillId(result.subject, result.skill);
            if (!data.skills[id]) throw new Error("Choose a valid ACT skill before saving a quiz.");
            if (!Number.isFinite(result.score) || result.score < 0 || result.score > 100) {
                throw new RangeError("Quiz score must be between 0 and 100.");
            }
            data.quizResults.push({ id: `quiz-${Date.now()}`, date: new Date().toISOString(), ...result });
            data.skills[id].score = Math.round((data.skills[id].score + result.score) / 2);
            if (data.skills[id].manualLevel !== "Paused") data.skills[id].manualLevel = null;
        });
    }

    function setSkillLevel(id, level) {
        if (!["Automatic", "Core", "Advanced", "Mastery", "Paused"].includes(level)) {
            throw new Error("Choose Automatic, Core, Advanced, Mastery, or Paused for a skill level.");
        }
        return update(data => {
            const skill = data.skills[id];
            if (!skill) throw new Error("The selected ACT skill could not be found.");
            skill.manualLevel = level === "Automatic" ? null : level;
        });
    }

    function recordPracticeTest(test) {
        if (!test || typeof test !== "object") throw new Error("Practice test details are required.");
        if (test.compositeScore !== undefined &&
            (!Number.isInteger(Number(test.compositeScore)) ||
                Number(test.compositeScore) < 1 || Number(test.compositeScore) > 36)) {
            throw new RangeError("Composite score must be between 1 and 36.");
        }
        if (test.score !== undefined &&
            (!Number.isFinite(Number(test.score)) || Number(test.score) < 0 || Number(test.score) > 100)) {
            throw new RangeError("Practice-test percentage must be between 0 and 100.");
        }
        if (test.writingScore !== undefined && test.writingScore !== null &&
            (!Number.isInteger(Number(test.writingScore)) ||
                Number(test.writingScore) < 2 || Number(test.writingScore) > 12)) {
            throw new RangeError("Writing score must be between 2 and 12.");
        }
        if (test.date !== undefined && !Number.isFinite(new Date(test.date).getTime())) {
            throw new Error("Enter a valid practice-test date.");
        }
        return update(data => {
            data.practiceTests.push({
                id: makeId("practice-test"),
                date: new Date().toISOString(),
                ...test
            });
        });
    }

    function addStrategy(strategy) {
        if (!strategy || !Object.hasOwn(SUBJECTS, strategy.subject)) {
            throw new Error("Choose a valid ACT subject for your strategy.");
        }

        const title = String(strategy.title || "").trim();
        const explanation = String(strategy.explanation || "").trim();
        if (!title || !explanation) {
            throw new Error("A strategy needs a title and an explanation.");
        }

        return update(data => {
            data.strategies.push({
                id: `strategy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                subject: strategy.subject,
                title,
                explanation,
                tips: String(strategy.tips || "").trim(),
                example: String(strategy.example || "").trim(),
                mistakes: String(strategy.mistakes || "").trim(),
                createdAt: new Date().toISOString()
            });
        });
    }

    function toggleStrategyBookmark(id) {
        if (typeof id !== "string" || !id) {
            throw new Error("Choose a strategy to bookmark.");
        }
        return update(data => {
            const index = data.bookmarks.indexOf(id);
            if (index === -1) data.bookmarks.push(id);
            else data.bookmarks.splice(index, 1);
        });
    }

    function subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    function init() {
        let saved;
        try {
            saved = localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            throw new Error("ACT study data could not be read from this browser.", { cause: error });
        }

        if (!saved) {
            state = createInitialState();
            save();
            return;
        }

        try {
            const parsed = JSON.parse(saved);
            const defaults = createInitialState();
            if (!parsed || typeof parsed !== "object" || parsed.version !== 1) {
                throw new Error("The saved ACT data has an unsupported format.");
            }
            state = {
                ...defaults,
                ...parsed,
                goals: { ...defaults.goals, ...(parsed.goals || {}) },
                skills: { ...defaults.skills, ...(parsed.skills || {}) },
                crystalRewards: Array.isArray(parsed.crystalRewards)
                    ? parsed.crystalRewards
                    : defaults.crystalRewards
            };
            listeners.forEach(listener => listener(clone(state)));
        } catch (error) {
            throw new Error(`Saved ACT study data could not be loaded: ${error.message}`, { cause: error });
        }
    }

    window.ACTData = {
        STORAGE_KEY,
        SUBJECTS,
        skillId,
        skillLevel,
        getSkillLevel,
        init,
        getState,
        getCrystalBalance,
        awardCrystals,
        subscribe,
        recordStudyMinutes,
        completeLesson,
        recordQuizResult,
        recordQuizSession,
        recordPracticeTest,
        addIncorrectAnswer,
        setIncorrectReviewed,
        removeIncorrectAnswer,
        updateGoals,
        addStrategy,
        toggleStrategyBookmark,
        setSkillLevel
    };

    window.FirebaseSyncReady = window.FirebaseSyncReady || import("../firebase-sync.js").catch(error => {
        console.error("Firebase sync could not start:", error);
        return null;
    });
}());
