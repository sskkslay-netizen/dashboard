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
            practiceTests: [],
            incorrectAnswers: [],
            strategies: [],
            bookmarks: [],
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

    function recordStudyMinutes(minutes, note = "") {
        if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) {
            throw new RangeError("Study time must be between 1 and 1,440 whole minutes.");
        }

        return update(data => {
            data.totalStudyMinutes += minutes;
            data.studySessions.push({
                id: `study-${Date.now()}`,
                date: new Date().toISOString(),
                minutes,
                note: String(note).trim()
            });
        });
    }

    function completeLesson(subject, skill, score, skillScore) {
        return update(data => {
            const id = skillId(subject, skill);
            if (!data.skills[id]) throw new Error("Choose a valid ACT skill before completing a lesson.");
            if (!Number.isFinite(score) || score < 0 || score > 100) {
                throw new RangeError("Lesson quiz score must be between 0 and 100.");
            }

            data.lessons.push({
                id: `lesson-${Date.now()}`,
                subject,
                skill,
                date: new Date().toISOString().slice(0, 10),
                score,
                completed: true,
                source: "lesson"
            });
            if (Number.isFinite(skillScore)) data.skills[id].score = Math.round(skillScore);
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
        if (!["Core", "Advanced", "Mastery", "Paused"].includes(level)) {
            throw new Error("Choose Core, Advanced, Mastery, or Paused for a skill level.");
        }
        return update(data => {
            const skill = data.skills[id];
            if (!skill) throw new Error("The selected ACT skill could not be found.");
            skill.manualLevel = level === getSkillLevel(skill) ? null : level;
        });
    }

    function recordPracticeTest(test) {
        if (!test || typeof test !== "object") throw new Error("Practice test details are required.");
        return update(data => {
            data.practiceTests.push({
                id: `practice-test-${Date.now()}`,
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
                skills: { ...defaults.skills, ...(parsed.skills || {}) }
            };
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
        subscribe,
        recordStudyMinutes,
        completeLesson,
        recordQuizResult,
        recordPracticeTest,
        addStrategy,
        toggleStrategyBookmark,
        setSkillLevel
    };
}());
