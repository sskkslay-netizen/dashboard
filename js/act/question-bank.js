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
        },
        {
            id: "english-modifiers-1",
            subject: "English",
            skill: "Grammar: Modifiers",
            difficulty: "Medium",
            prompt: "Which revision makes clear that Lena, not the cabin, cycled for two hours? “After cycling for two hours, the cabin came into view.”",
            options: [
                "After cycling for two hours, the cabin came into view for Lena.",
                "After cycling for two hours, Lena saw the cabin come into view.",
                "The cabin, after cycling for two hours, came into view.",
                "The cabin came into view after cycling for two hours."
            ],
            answer: 1,
            explanation: "The opening phrase now sits next to Lena, the person who did the cycling, so the modifier has a clear subject."
        },
        {
            id: "english-pronouns-1",
            subject: "English",
            skill: "Grammar: Pronouns",
            difficulty: "Medium",
            prompt: "Which revision removes the unclear pronoun in “When Maya called Elena, she was already at the station”?",
            options: [
                "When Maya called Elena, she was already waiting at the station.",
                "Maya called Elena, who was already at the station.",
                "When Maya called her, Elena was already at the station.",
                "Maya called Elena because she was already at the station."
            ],
            answer: 1,
            explanation: "Naming Elena as the person at the station makes the reference explicit rather than leaving “she” ambiguous."
        },
        {
            id: "english-parallelism-1",
            subject: "English",
            skill: "Grammar: Parallelism",
            difficulty: "Easy",
            prompt: "Which choice completes the sentence with parallel structure? “The club plans to recruit volunteers, ___, and to publish a monthly report.”",
            options: ["raising funds", "to raise funds", "funds are raised", "and raised funds"],
            answer: 1,
            explanation: "The list uses infinitive phrases: to recruit, to raise, and to publish."
        },
        {
            id: "english-sentence-structure-1",
            subject: "English",
            skill: "Grammar: Sentence Structure",
            difficulty: "Medium",
            prompt: "Which choice correctly joins the two complete sentences? “The forecast changed. The hikers chose a shorter route.”",
            options: [
                "The forecast changed, the hikers chose a shorter route.",
                "The forecast changed; the hikers chose a shorter route.",
                "The forecast changed because, the hikers chose a shorter route.",
                "The forecast changed the hikers chose, a shorter route."
            ],
            answer: 1,
            explanation: "A semicolon correctly joins two closely related independent clauses."
        },
        {
            id: "math-systems-1",
            subject: "Math",
            skill: "Algebra: Solving Systems of Linear Equations",
            difficulty: "Medium",
            prompt: "If x + y = 11 and x − y = 3, what is the value of x?",
            options: ["4", "6", "7", "8"],
            answer: 2,
            explanation: "Add the equations to eliminate y: 2x = 14, so x = 7."
        },
        {
            id: "math-slope-1",
            subject: "Math",
            skill: "Coordinate Geometry: Lines and Slopes",
            difficulty: "Easy",
            prompt: "What is the slope of the line through (2, 1) and (5, 10)?",
            options: ["2", "3", "4", "9"],
            answer: 1,
            explanation: "Slope is (10 − 1)/(5 − 2) = 9/3 = 3."
        },
        {
            id: "math-circles-1",
            subject: "Math",
            skill: "Geometry: Circles",
            difficulty: "Easy",
            prompt: "A circle has a diameter of 10 units. What is its circumference?",
            options: ["5π", "10π", "20π", "100π"],
            answer: 1,
            explanation: "Circumference is π times diameter, so it is 10π units."
        },
        {
            id: "math-probability-1",
            subject: "Math",
            skill: "Data: Categorical Data and Probabilities",
            difficulty: "Easy",
            prompt: "A jar contains 3 red tiles and 2 blue tiles. If one tile is selected at random, what is the probability it is red?",
            options: ["2/5", "3/5", "1/2", "3/2"],
            answer: 1,
            explanation: "There are 3 favorable red tiles out of 5 total tiles, giving a probability of 3/5."
        },
        {
            id: "reading-overview-1",
            subject: "Reading",
            skill: "Passage Overview",
            difficulty: "Medium",
            prompt: "A passage describes a town's rooftop garden project, explains how residents organized it, and reports that nearby summer temperatures later decreased. Which overview best captures the passage?",
            options: [
                "A description of how a community garden was organized and what effect it may have had",
                "A list of every plant grown on one rooftop",
                "An argument that all cities have identical climates",
                "A comparison of gardening tools used by residents"
            ],
            answer: 0,
            explanation: "This choice captures both the project and the passage's report about its possible effect without narrowing to a minor detail."
        },
        {
            id: "reading-detail-2",
            subject: "Reading",
            skill: "Finding Key Details",
            difficulty: "Easy",
            prompt: "The observatory opens its doors to visitors on Friday evenings, when volunteers demonstrate the telescope. On which evenings can visitors attend?",
            options: ["Monday evenings", "Wednesday evenings", "Friday evenings", "Every evening"],
            answer: 2,
            explanation: "The passage directly states that visitors can attend on Friday evenings."
        },
        {
            id: "reading-inference-2",
            subject: "Reading",
            skill: "Inference",
            difficulty: "Medium",
            prompt: "Before the museum opened, Imani moved the display away from a sunny window and checked the temperature sensor twice. Which inference is best supported?",
            options: [
                "She was taking steps to protect the display from heat or sunlight.",
                "The display had already been damaged.",
                "The museum was closing permanently.",
                "She wanted visitors to avoid the gallery."
            ],
            answer: 0,
            explanation: "Moving the display and checking temperature suggest care about its exposure, but the passage does not say it was damaged."
        },
        {
            id: "reading-context-2",
            subject: "Reading",
            skill: "Words and Phrases in Context",
            difficulty: "Easy",
            prompt: "“After several trials, the engineer refined the design to reduce vibration.” In context, refined most nearly means:",
            options: ["abandoned", "improved", "measured", "copied"],
            answer: 1,
            explanation: "The engineer changed the design to reduce a problem, so refined means improved or made more precise."
        },
        {
            id: "science-fact-finding-1",
            subject: "Science",
            skill: "Fact Finding",
            difficulty: "Easy",
            prompt: "A data table lists the sample mass as 14 grams in Trial 2. What mass is reported for Trial 2?",
            options: ["4 grams", "12 grams", "14 grams", "24 grams"],
            answer: 2,
            explanation: "The stated Trial 2 value is 14 grams; match the trial and unit rather than using another row."
        },
        {
            id: "science-hypothetical-1",
            subject: "Science",
            skill: "Hypothetical Changes",
            difficulty: "Medium",
            prompt: "In a set of trials, a reaction took longer at lower temperatures. If the temperature is lowered again and other conditions stay constant, what is best predicted?",
            options: [
                "The reaction will likely take longer.",
                "The reaction will certainly stop producing any product.",
                "The amount of material will automatically double.",
                "The relationship cannot be considered at all."
            ],
            answer: 0,
            explanation: "Extending the observed trend supports a longer reaction time, while the data does not justify claims about stopping or doubling."
        },
        {
            id: "science-experiments-1",
            subject: "Science",
            skill: "Interpreting Experiments",
            difficulty: "Medium",
            prompt: "Two groups of seeds receive the same soil, water, and light. One group receives a new fertilizer and sprouts more often. Which conclusion is best supported?",
            options: [
                "The fertilizer is associated with more sprouting under these test conditions.",
                "The fertilizer will improve every plant in every environment.",
                "Water has no effect on seed growth.",
                "The seeds sprouted because the groups used different soil."
            ],
            answer: 0,
            explanation: "The controlled comparison supports an association under the tested conditions, not a universal claim."
        },
        {
            id: "science-viewpoints-1b",
            subject: "Science",
            skill: "Understanding Viewpoints",
            difficulty: "Medium",
            prompt: "Researcher Lee argues that shade lowers stream temperature. Researcher Ortiz argues that upstream water flow is the main influence. Which statement expresses Lee's viewpoint?",
            options: [
                "Shade lowers the temperature of the stream.",
                "Upstream flow is the main influence on temperature.",
                "Stream temperature was never measured.",
                "Shade and water flow are identical factors."
            ],
            answer: 0,
            explanation: "Lee's stated claim links shade to lower stream temperature; Ortiz's contrasting claim should not be attributed to Lee."
        }
    ];
}());
