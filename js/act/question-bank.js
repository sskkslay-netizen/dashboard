/* Original ACT-style questions shared by quizzes, lessons, and practice tests. */
(function () {
    "use strict";

    window.ACTQuestionBank = [
        {
            id: "english-agreement-1",
            subject: "English",
            skill: "Grammar: Agreement",
            difficulty: "Easy",
            prompt: "Neither the editor nor the writers ___ available to review the final draft.",
            options: ["is", "are", "was", "be"],
            answer: 1,
            explanation: "With neither/nor, the verb agrees with the nearer subject. Writers is plural, so are is correct."
        },
        {
            id: "english-punctuation-1",
            subject: "English",
            skill: "Grammar: Punctuation",
            difficulty: "Medium",
            prompt: "The trail was steep ___ however, the hikers reached the overlook before sunset.",
            options: [", however,", "; however,", ": however;", "however;"],
            answer: 1,
            explanation: "A semicolon can join the two independent clauses, and however is followed by a comma."
        },
        {
            id: "english-concision-1",
            subject: "English",
            skill: "Rhetoric: Concision",
            difficulty: "Easy",
            prompt: "Which choice expresses the idea most concisely? “Because rain fell during the afternoon, the game was postponed.”",
            options: [
                "The game was postponed because it rained that afternoon.",
                "Due to the fact that rain was falling, the game was postponed.",
                "The game, which was planned, was postponed because rain fell.",
                "Rain fell during the afternoon, and for that reason the game was postponed."
            ],
            answer: 0,
            explanation: "The first choice keeps the full meaning while removing unnecessary phrases."
        },
        {
            id: "english-transitions-1",
            subject: "English",
            skill: "Rhetoric: Transitions",
            difficulty: "Medium",
            prompt: "The first trial included only six volunteers. ___, the research team repeated it with a larger group.",
            options: ["For example", "Instead", "Therefore", "Meanwhile"],
            answer: 2,
            explanation: "Repeating the small trial follows from its limited size, so Therefore expresses the logical result."
        },
        {
            id: "math-linear-1",
            subject: "Math",
            skill: "Algebra: Define and Interpret Linear Function",
            difficulty: "Easy",
            prompt: "A function is defined by f(x) = 3x − 2. What is f(4)?",
            options: ["8", "10", "12", "14"],
            answer: 1,
            explanation: "Substitute 4 for x: f(4) = 3(4) − 2 = 10."
        },
        {
            id: "math-inequality-1",
            subject: "Math",
            skill: "Algebra: Inequalities",
            difficulty: "Medium",
            prompt: "Which inequality is equivalent to 3x − 5 < 7?",
            options: ["x < 2", "x < 4", "x > 2", "x > 4"],
            answer: 1,
            explanation: "Add 5 to both sides to get 3x < 12, then divide by 3 to get x < 4."
        },
        {
            id: "math-matrices-1",
            subject: "Math",
            skill: "Matrices",
            difficulty: "Medium",
            prompt: "What is the sum of [[1, 2], [3, 4]] and [[4, 0], [−1, 2]]?",
            options: ["[[5, 2], [2, 6]]", "[[4, 2], [−3, 8]]", "[[5, 0], [3, 8]]", "[[4, 2], [2, 6]]"],
            answer: 0,
            explanation: "Add corresponding entries: 1+4=5, 2+0=2, 3+(−1)=2, and 4+2=6."
        },
        {
            id: "math-ratio-1",
            subject: "Math",
            skill: "Ratios and Proportions",
            difficulty: "Easy",
            prompt: "A mixture uses red and blue paint in a ratio of 3:5. If the mixture contains 40 cups total, how many cups are red?",
            options: ["8", "15", "24", "25"],
            answer: 1,
            explanation: "There are 8 total ratio parts, so each part is 40 ÷ 8 = 5 cups. Red paint is 3 × 5 = 15 cups."
        },
        {
            id: "reading-detail-1",
            subject: "Reading",
            skill: "Finding Key Details",
            difficulty: "Easy",
            prompt: "Mara moved the seedlings to a south-facing windowsill. After one week, the leaves closest to the window had grown the most. Where did Mara move the seedlings?",
            options: ["To a greenhouse", "To a south-facing windowsill", "To an outdoor garden", "To a shaded shelf"],
            answer: 1,
            explanation: "The passage directly states that Mara moved them to a south-facing windowsill."
        },
        {
            id: "reading-inference-1",
            subject: "Reading",
            skill: "Inference",
            difficulty: "Medium",
            prompt: "Mara folded her map, checked the time, and asked whether the bridge had reopened. Which inference is best supported?",
            options: [
                "She is planning a route that may depend on the bridge.",
                "She has never traveled in the area.",
                "The bridge is permanently closed.",
                "She has already reached her destination."
            ],
            answer: 0,
            explanation: "Her actions suggest that she is planning a route and needs current information about the bridge."
        },
        {
            id: "reading-context-1",
            subject: "Reading",
            skill: "Words and Phrases in Context",
            difficulty: "Easy",
            prompt: "“The analyst reserved judgment until the second set of results arrived.” In this sentence, reserved most nearly means:",
            options: ["booked", "withheld", "celebrated", "repeated"],
            answer: 1,
            explanation: "The analyst waited before deciding, so reserved means withheld or delayed."
        },
        {
            id: "reading-purpose-1",
            subject: "Reading",
            skill: "Analyzing Text Structure and Purpose",
            difficulty: "Hard",
            prompt: "A passage first describes a common explanation for a migration, then presents tracking data that challenges it. What is the main purpose of the data paragraph?",
            options: [
                "To provide evidence that complicates the earlier explanation",
                "To list unrelated facts about tracking equipment",
                "To repeat the explanation without evaluation",
                "To introduce a new migration season"
            ],
            answer: 0,
            explanation: "The paragraph's placement and evidence work together to question the explanation introduced earlier."
        },
        {
            id: "science-trend-1",
            subject: "Science",
            skill: "Interpreting Trends",
            difficulty: "Easy",
            prompt: "A table shows that when input rises from 2 to 4 to 6 units, output rises from 4 to 7 to 10 units. If the pattern continues, what output is predicted at 8 input units?",
            options: ["11", "12", "13", "14"],
            answer: 2,
            explanation: "Each 2-unit increase in input adds 3 output units. From 10, the next output is 13."
        },
        {
            id: "science-design-1",
            subject: "Science",
            skill: "Experimental Design",
            difficulty: "Medium",
            prompt: "A student tests whether different amounts of light affect plant growth. Which factor should be changed between groups?",
            options: ["The amount of light", "The plant species", "The measurement schedule", "The soil used"],
            answer: 0,
            explanation: "The amount of light is the independent variable being tested. Other conditions should remain consistent."
        },
        {
            id: "science-calculation-1",
            subject: "Science",
            skill: "Calculations",
            difficulty: "Easy",
            prompt: "A sample contains 12 grams of a substance in 3 liters of solution. What is its concentration?",
            options: ["3 g/L", "4 g/L", "9 g/L", "36 g/L"],
            answer: 1,
            explanation: "Concentration is mass divided by volume: 12 ÷ 3 = 4 grams per liter."
        },
        {
            id: "science-viewpoints-1",
            subject: "Science",
            skill: "Comparing Viewpoints",
            difficulty: "Hard",
            prompt: "Researcher A argues that a wetland reduces flooding by storing runoff. Researcher B agrees it stores water but says the effect depends on soil saturation. What do the researchers share?",
            options: [
                "Both consider the wetland's water-storage role.",
                "Both say wetlands increase flooding.",
                "Both believe soil saturation is irrelevant.",
                "Both oppose measuring runoff."
            ],
            answer: 0,
            explanation: "Both viewpoints discuss water storage; they differ about when it reduces flooding."
        }
    ];
}());
