/* Skill-specific ACT explanations, examples, and quick checks. */
(function () {
    "use strict";

    window.ACTTopicExplainers = {
        English: {
            "Grammar: Agreement": {
                explanation: "A verb must match its true subject in number. Ignore prepositional phrases and other words that sit between the subject and verb.",
                example: "“The stack of notebooks is on the desk.” The subject is stack, so the singular verb is matches it.",
                tip: "Ask who or what is doing the action, then temporarily ignore the words between that subject and its verb."
            },
            "Grammar: Comparisons and Descriptions": {
                explanation: "A comparison should compare like things and make the relationship clear. Descriptive phrases should attach to the words they actually describe.",
                example: "“Unlike the city bus, the train runs all night.” This compares two forms of transportation.",
                tip: "Name both sides of the comparison. If they are not the same kind of thing, revise the sentence."
            },
            "Grammar: Conventional Expression": {
                explanation: "Standard English includes established word pairings and idioms. Choose the preposition or phrase that completes the expression naturally and precisely.",
                example: "“The result depends on the sample size.” The conventional expression is depends on.",
                tip: "Read the whole phrase aloud, but use standard usage—not sound alone—to decide."
            },
            "Grammar: Modifiers": {
                explanation: "A modifying phrase should sit next to the word it describes. Otherwise, a sentence can accidentally make an object appear to perform a person’s action.",
                example: "“Walking through the gallery, Nia noticed a new painting.” Nia is the person walking.",
                tip: "Ask who performs the action in each opening phrase and check that the sentence names that person immediately."
            },
            "Grammar: Parallelism": {
                explanation: "Items in a list or paired construction should use matching grammatical forms. Parallel structure makes related ideas easier to follow.",
                example: "“The team plans to measure, compare, and record the results.” Each list item is a verb in the same form.",
                tip: "Read list items after the introductory words; make their grammatical patterns match."
            },
            "Grammar: Pronouns": {
                explanation: "A pronoun should clearly refer to a specific noun and agree with that noun. Avoid sentences where more than one noun could be its antecedent.",
                example: "Instead of “When Lina called Mara, she was at home,” write “Lina called Mara, who was at home.”",
                tip: "Replace the pronoun with its intended noun. If the reference is uncertain or the noun does not agree, revise."
            },
            "Grammar: Punctuation": {
                explanation: "Punctuation shows how clauses and phrases relate. A comma alone cannot join two complete sentences; use a period, semicolon, or comma with a coordinating conjunction.",
                example: "“The rain stopped; the match resumed.” Both sides of the semicolon are complete sentences.",
                tip: "Find the subject and verb on both sides before choosing punctuation."
            },
            "Grammar: Sentence Structure": {
                explanation: "A complete sentence needs an independent clause. Connect complete thoughts with appropriate punctuation and make dependent clauses part of a complete sentence.",
                example: "“Because the path was flooded, we chose another route.” The dependent opening clause is completed by an independent clause.",
                tip: "Check whether each sentence has a complete subject–verb thought; repair fragments and run-ons."
            },
            "Grammar: Verb Tense": {
                explanation: "Verb tense signals when actions occur. Keep tense consistent unless the timeline gives a clear reason to shift.",
                example: "“The class collected samples yesterday and will analyze them tomorrow.” The verbs match the stated timeline.",
                tip: "Mark the time of each action and keep the verbs aligned with that sequence."
            },
            "Rhetoric: Author Intent": {
                explanation: "An author's intent is the reason a passage or section was written, such as explaining a process, supporting a claim, or challenging an assumption.",
                example: "A paragraph that tests a popular explanation against new evidence is intended to evaluate that explanation.",
                tip: "Summarize what the author is doing with a verb—explaining, comparing, qualifying, or persuading."
            },
            "Rhetoric: Concision": {
                explanation: "The clearest revision expresses the intended meaning without repetition or needless wording. Shorter is not better if it removes an important idea.",
                example: "“At this point in time” can become “now” when the meaning stays the same.",
                tip: "Remove a phrase only after checking that the revised sentence keeps every necessary detail."
            },
            "Rhetoric: Relevance": {
                explanation: "A detail belongs when it advances the paragraph's focus or supports its main point. Interesting information can still be irrelevant in context.",
                example: "In a paragraph about a bridge's design, a sentence about the engineer's unrelated hobby distracts from the focus.",
                tip: "State the paragraph's main point in a few words, then test each sentence against it."
            },
            "Rhetoric: Structure and Organization": {
                explanation: "Good organization gives ideas a logical order, such as sequence, cause and effect, problem and solution, or claim and evidence.",
                example: "A process explanation is easiest to follow when its steps appear in the order they happen.",
                tip: "Identify the relationship between neighboring paragraphs before deciding where a sentence belongs."
            },
            "Rhetoric: Tone": {
                explanation: "Tone is the author's attitude toward the subject, conveyed through word choice and emphasis. Support a tone label with language from the passage.",
                example: "Careful qualifications and measured claims suggest a cautious tone rather than an absolute one.",
                tip: "Notice repeated evaluative words and distinguish the author's attitude from the topic itself."
            },
            "Rhetoric: Transitions": {
                explanation: "A transition signals the logical relationship between ideas: contrast, addition, example, cause, or result.",
                example: "“The first sample was too small; therefore, the team collected more data.” Therefore signals a result.",
                tip: "Describe the connection between the two ideas in your own words before choosing a transition."
            }
        },
        Math: {
            "Algebra: Define and Interpret Linear Function": {
                explanation: "A linear function changes at a constant rate and can be written as f(x) = mx + b, where m is the rate of change and b is the starting value.",
                example: "For f(x) = 3x − 2, f(4) = 3(4) − 2 = 10.",
                tip: "Substitute the input carefully and distinguish the rate from the starting value."
            },
            "Algebra: Exponential Functions": {
                explanation: "An exponential expression has the variable in the exponent. Repeated multiplication by a fixed factor creates exponential growth or decay.",
                example: "In 5 · 2^t, the starting amount is 5 and the amount doubles for each increase of 1 in t.",
                tip: "Look for a repeated factor over equal steps; do not confuse it with adding a constant amount."
            },
            "Algebra: Inequalities": {
                explanation: "Solve an inequality much like an equation, but reverse its direction when multiplying or dividing both sides by a negative number.",
                example: "−2x < 8 becomes x > −4 after dividing both sides by −2.",
                tip: "Circle any negative divisor or multiplier and reverse the inequality at that step."
            },
            "Algebra: Integers": {
                explanation: "Integer operations follow sign rules. For addition, combine magnitudes for like signs and subtract magnitudes for unlike signs.",
                example: "−7 + 12 = 5 because the positive amount exceeds the negative amount by 5.",
                tip: "Estimate the sign of the answer before calculating."
            },
            "Algebra: Manipulating Polynomials": {
                explanation: "Combine like terms and use the distributive property to expand or factor polynomial expressions.",
                example: "3x + 2(x − 4) = 3x + 2x − 8 = 5x − 8.",
                tip: "Distribute to every term inside parentheses, then combine only terms with matching variables and exponents."
            },
            "Algebra: Simplifying Exponents": {
                explanation: "Exponent rules describe repeated multiplication: multiply powers with the same base by adding exponents, and divide them by subtracting exponents.",
                example: "x³ · x² = x⁵, while x⁵ ÷ x² = x³ for nonzero x.",
                tip: "Use exponent rules only when the bases match, and keep track of negative exponents."
            },
            "Algebra: Solving Single Variable Equations": {
                explanation: "Use inverse operations to isolate the variable while keeping both sides balanced.",
                example: "2x + 5 = 13 → 2x = 8 → x = 4.",
                tip: "Undo addition or subtraction before multiplication or division, then substitute to check."
            },
            "Algebra: Solving Systems of Linear Equations": {
                explanation: "A solution to a system makes every equation true. Substitution or elimination finds the point where the lines intersect.",
                example: "For x + y = 11 and x − y = 3, add the equations to get 2x = 14; then x = 7 and y = 4.",
                tip: "Check the ordered pair in both original equations."
            },
            "Coordinate Geometry: Lines and Slopes": {
                explanation: "Slope measures vertical change per horizontal change: m = (y₂ − y₁)/(x₂ − x₁).",
                example: "From (1, 2) to (3, 6), the slope is (6 − 2)/(3 − 1) = 2.",
                tip: "Subtract y-values and x-values in the same point order."
            },
            "Coordinate Geometry: Nonlinear Functions": {
                explanation: "A nonlinear function does not have a constant rate of change. Its graph may curve, and equal input steps can produce changing output differences.",
                example: "For y = x², outputs at x = 1, 2, 3 are 1, 4, 9; the increases are not constant.",
                tip: "Compare successive output changes to decide whether a relationship is linear."
            },
            "Coordinate Geometry: Points": {
                explanation: "An ordered pair (x, y) locates a point by moving horizontally first and vertically second from the origin.",
                example: "The point (−2, 3) is two units left and three units up.",
                tip: "Keep x and y in their stated order and check the signs against the quadrant."
            },
            "Data: Categorical Data and Probabilities": {
                explanation: "Categorical data sorts observations into groups. Probability is favorable outcomes divided by all equally likely outcomes.",
                example: "A bag with 3 red and 2 blue tiles has probability 3/5 of yielding red on one draw.",
                tip: "Count the full sample space and confirm that the probability is between 0 and 1."
            },
            "Data: Mean, Median, Mode, Standard Deviation": {
                explanation: "Mean is the arithmetic average, median is the middle ordered value, and mode is the most frequent value. Standard deviation describes spread around the mean.",
                example: "For 2, 3, 3, 8, the mean is 4, the median is 3, and the mode is 3.",
                tip: "Sort the values before finding the median, and check whether an outlier shifts the mean."
            },
            "Geometry: Circles": {
                explanation: "A circle's radius runs from its center to its edge. Circumference is 2πr and area is πr².",
                example: "If the diameter is 10, the radius is 5 and the circumference is 10π.",
                tip: "Convert diameter to radius before using the area formula."
            },
            "Geometry: Lines and Angles": {
                explanation: "Angles on a straight line total 180°, angles around a point total 360°, and vertical angles are equal.",
                example: "If one angle on a straight line is 68°, its adjacent angle is 112°.",
                tip: "Mark known equal or supplementary angles before solving."
            },
            "Geometry: Polygons": {
                explanation: "The interior angles of an n-sided polygon total (n − 2) × 180°. A regular polygon has equal sides and equal angles.",
                example: "A pentagon's interior angle sum is (5 − 2) × 180° = 540°.",
                tip: "Count the sides carefully and distinguish the total angle sum from one angle."
            },
            "Geometry: Solid Geometry": {
                explanation: "Three-dimensional figures use formulas for volume and surface area. Track units: volume uses cubic units, while area uses square units.",
                example: "A rectangular prism 2 by 3 by 4 has volume 2 × 3 × 4 = 24 cubic units.",
                tip: "Sketch and label the dimensions before choosing a formula."
            },
            "Geometry: Triangles": {
                explanation: "Triangle angles total 180°. Area is one-half base times height, and side relationships depend on the triangle type.",
                example: "A triangle with base 8 and perpendicular height 5 has area ½ × 8 × 5 = 20.",
                tip: "Use the perpendicular height—not a slanted side—in the area formula."
            },
            "Geometry: Trigonometry": {
                explanation: "In a right triangle, sine, cosine, and tangent relate an angle to side ratios: opposite/hypotenuse, adjacent/hypotenuse, and opposite/adjacent.",
                example: "For an angle with opposite side 3 and hypotenuse 5, sine of the angle is 3/5.",
                tip: "Label sides relative to the chosen angle before selecting a ratio."
            },
            "Function Notation": {
                explanation: "Function notation names an output. f(a) means evaluate the function rule using a as its input.",
                example: "If f(x) = 2x + 1, then f(3) = 2(3) + 1 = 7.",
                tip: "Treat the expression inside parentheses as the input; f is not multiplication."
            },
            "Matrices": {
                explanation: "Matrices organize values into rows and columns. Add or subtract matching positions; matrix multiplication requires compatible dimensions.",
                example: "[[1, 2], [3, 4]] + [[4, 0], [−1, 2]] = [[5, 2], [2, 6]].",
                tip: "Check dimensions first and keep row and column positions aligned."
            },
            "Numbers: Sequences": {
                explanation: "A sequence follows a rule. Constant differences indicate an arithmetic sequence; constant ratios indicate a geometric sequence.",
                example: "4, 7, 10, 13 has a constant difference of 3, so its next term is 16.",
                tip: "Compare differences first, then ratios if the differences are not constant."
            },
            "Rational and Irrational Numbers": {
                explanation: "Rational numbers can be written as a ratio of integers; irrational numbers cannot and have nonterminating, nonrepeating decimals.",
                example: "√9 = 3 is rational, while √2 is irrational.",
                tip: "Simplify radicals before deciding whether their values are rational."
            },
            "Rational Expressions": {
                explanation: "A rational expression is a ratio of polynomials. Factor and cancel common factors, while excluding values that make an original denominator zero.",
                example: "(x² − 9)/(x − 3) simplifies to x + 3 only when x ≠ 3.",
                tip: "Factor completely and keep the original denominator's restrictions."
            },
            "Ratios and Proportions": {
                explanation: "A ratio compares quantities by division. Equivalent ratios scale every part by the same factor.",
                example: "In a 3:5 mixture with 40 total parts, there are 8 ratio parts; each is 5, so the first amount is 15.",
                tip: "Keep units consistent and identify whether the question gives one part or the whole."
            }
        },
        Reading: {
            "Passage Overview": {
                explanation: "A passage overview captures the central subject and the author's main development of it without getting lost in minor details.",
                example: "If a passage describes a town restoring a river and then measures the results, its overview is the restoration effort and what it changed.",
                tip: "After each paragraph, note its role in a few words; use those notes to identify the passage's arc."
            },
            "Finding Key Details": {
                explanation: "A detail question asks for information stated in the passage. Return to the relevant lines and match the choice to the text.",
                example: "If the passage says the seedlings moved to a south-facing window, that location is a direct detail.",
                tip: "Search for a distinctive word from the question, then reread the surrounding sentence."
            },
            "Inference": {
                explanation: "An inference is a cautious conclusion supported by clues in the passage. It should not add assumptions the evidence cannot establish.",
                example: "A character checks a map and asks whether a bridge reopened, suggesting the route may depend on that bridge.",
                tip: "Combine two or more textual clues, then reject any choice that goes beyond them."
            },
            "Words and Phrases in Context": {
                explanation: "A word's meaning depends on how it is used in the sentence and passage, not only on its most familiar definition.",
                example: "In “the analyst reserved judgment,” reserved means withheld rather than booked.",
                tip: "Replace the word with a simple synonym and see whether the sentence's meaning still fits."
            },
            "Analyzing Text Structure and Purpose": {
                explanation: "Structure questions ask how sections relate; purpose questions ask what a detail or paragraph contributes to the author's larger point.",
                example: "A paragraph presenting new tracking data after a common theory may challenge or qualify that theory.",
                tip: "Describe the paragraph's job in relation to the one before it, not just its topic."
            }
        },
        Science: {
            "Basic Science": {
                explanation: "Science questions rely on the information provided, including definitions, procedures, and established relationships. Use the passage's evidence rather than outside assumptions.",
                example: "If a passage defines a mineral by hardness and luster, apply those stated criteria to the sample.",
                tip: "Locate the relevant definition or rule first and use it consistently."
            },
            "Fact Finding": {
                explanation: "Fact-finding questions ask you to retrieve a specific value or observation from a table, graph, or experiment description.",
                example: "If Trial 2 shows 14 units at hour 3, report that value—not a nearby trial's result.",
                tip: "Match the row, column, time, and units before reading the value."
            },
            "Interpreting Trends": {
                explanation: "A trend describes how a measured quantity changes as another quantity changes. Compare several data points before extending a pattern.",
                example: "If output rises by 3 whenever input rises by 2, the next matching input step predicts an increase of 3.",
                tip: "State both what changes and the direction or rate of change."
            },
            "Calculations": {
                explanation: "Calculations combine values using the relationship stated in the prompt. Keep track of units and round only when needed.",
                example: "A 12-gram sample in 3 liters has concentration 12 ÷ 3 = 4 grams per liter.",
                tip: "Write the formula and units before substituting numbers."
            },
            "Experimental Design": {
                explanation: "A controlled experiment changes an independent variable, measures a dependent variable, and keeps other conditions consistent.",
                example: "To test light and plant growth, vary the light exposure and keep plant type, soil, and measurement schedule the same.",
                tip: "Identify what is changed, what is measured, and what must stay constant."
            },
            "Hypothetical Changes": {
                explanation: "A hypothetical asks what would likely happen if a condition changed. Apply the passage's stated relationship while keeping other conditions fixed.",
                example: "If a reaction slows at lower temperatures, the same results predict a slower reaction when temperature is reduced.",
                tip: "Change only the specified factor and avoid claiming more than the data supports."
            },
            "Interpreting Experiments": {
                explanation: "Interpret an experiment by comparing its treatment and control groups, identifying variables, and separating observations from explanations.",
                example: "If treated seeds sprout more often than untreated seeds under identical conditions, the treatment is associated with more sprouting.",
                tip: "Check whether the experiment actually tested the proposed cause before accepting a conclusion."
            },
            "Understanding Viewpoints": {
                explanation: "A viewpoint is a researcher's claim and supporting reasoning. Keep each researcher's evidence and conclusion distinct.",
                example: "One researcher may attribute growth to rainfall, while another emphasizes soil composition.",
                tip: "Summarize each viewpoint in one sentence before comparing them."
            },
            "Comparing Viewpoints": {
                explanation: "Compare viewpoints by identifying what they agree on, where they differ, and which evidence supports each claim.",
                example: "Two researchers may agree that a wetland stores water while disagreeing about whether that always prevents flooding.",
                tip: "Separate shared observations from contrasting explanations."
            }
        }
    };
}());
