/* Skill-specific ACT explanations, examples, and quick checks. */
(function () {
    "use strict";

    window.ACTTopicExplainers = {
        English: {
            "Grammar: Agreement": {
                explanation: "A verb must match its true subject in number. Ignore prepositional phrases and other words that sit between the subject and verb.",
                lesson: "First locate the subject that performs the verb; do not let a nearby noun distract you. In phrases such as \"the basket of apples,\" basket is the subject and of apples only describes it. With compound subjects, indefinite pronouns, or a subject separated from its verb, identify the full grammatical subject before deciding whether the verb should be singular or plural.",
                example: "“The stack of notebooks is on the desk.” The subject is stack, so the singular verb is matches it.",
                tip: "Ask who or what is doing the action, then temporarily ignore the words between that subject and its verb."
            },
            "Grammar: Comparisons and Descriptions": {
                explanation: "A comparison should compare like things and make the relationship clear. Descriptive phrases should attach to the words they actually describe.",
                lesson: "A comparison is logical only when both sides represent the same kind of thing: a person with a person, a plan with a plan, or one result with another. Watch for missing comparison words such as than or as. For modifiers, place descriptive words near the noun they describe so the sentence cannot accidentally assign an action or quality to the wrong subject.",
                example: "“Unlike the city bus, the train runs all night.” This compares two forms of transportation.",
                tip: "Name both sides of the comparison. If they are not the same kind of thing, revise the sentence."
            },
            "Grammar: Conventional Expression": {
                explanation: "Standard English includes established word pairings and idioms. Choose the preposition or phrase that completes the expression naturally and precisely.",
                lesson: "Some words regularly occur with particular prepositions or grammatical patterns, such as depend on or capable of. These combinations are conventional rather than predictable from a simple rule. Read the entire phrase in context, compare the answer choices, and prefer the standard expression that communicates the intended relationship without adding extra words.",
                example: "“The result depends on the sample size.” The conventional expression is depends on.",
                tip: "Read the whole phrase aloud, but use standard usage—not sound alone—to decide."
            },
            "Grammar: Modifiers": {
                explanation: "A modifying phrase should sit next to the word it describes. Otherwise, a sentence can accidentally make an object appear to perform a person’s action.",
                lesson: "An opening phrase often describes the subject that follows it. Ask who is doing the action in that phrase, then check whether the next clause names that person or thing. Also check that limiting words such as only and nearly sit beside the words they are meant to limit; moving them can change the sentence's meaning.",
                example: "“Walking through the gallery, Nia noticed a new painting.” Nia is the person walking.",
                tip: "Ask who performs the action in each opening phrase and check that the sentence names that person immediately."
            },
            "Grammar: Parallelism": {
                explanation: "Items in a list or paired construction should use matching grammatical forms. Parallel structure makes related ideas easier to follow.",
                lesson: "When a sentence joins items with and, or, both/and, or not only/but also, the joined parts should have matching grammatical shapes. Compare each item with the first one and read the complete list aloud. Parallel wording makes the relationship between ideas clear; it does not mean every item must use identical words.",
                example: "“The team plans to measure, compare, and record the results.” Each list item is a verb in the same form.",
                tip: "Read list items after the introductory words; make their grammatical patterns match."
            },
            "Grammar: Pronouns": {
                explanation: "A pronoun should clearly refer to a specific noun and agree with that noun. Avoid sentences where more than one noun could be its antecedent.",
                lesson: "Find the noun a pronoun replaces and check that the reader can identify it without guessing. The pronoun must agree in number and person, and its form must fit its role as a subject or object. If two nouns could be the antecedent, repeating or rearranging the noun is often clearer than keeping an ambiguous pronoun.",
                example: "Instead of “When Lina called Mara, she was at home,” write “Lina called Mara, who was at home.”",
                tip: "Replace the pronoun with its intended noun. If the reference is uncertain or the noun does not agree, revise."
            },
            "Grammar: Punctuation": {
                explanation: "Punctuation shows how clauses and phrases relate. A comma alone cannot join two complete sentences; use a period, semicolon, or comma with a coordinating conjunction.",
                lesson: "Before choosing punctuation, decide whether the words on each side form complete independent clauses. A semicolon can join two closely related complete clauses; a comma can join them when it is followed by a coordinating conjunction. A colon usually introduces an explanation or list after a complete clause. The relationship between the ideas should guide the mark.",
                example: "“The rain stopped; the match resumed.” Both sides of the semicolon are complete sentences.",
                tip: "Find the subject and verb on both sides before choosing punctuation."
            },
            "Grammar: Sentence Structure": {
                explanation: "A complete sentence needs an independent clause. Connect complete thoughts with appropriate punctuation and make dependent clauses part of a complete sentence.",
                lesson: "A dependent clause may have a subject and verb but still cannot stand alone because a word such as because, although, or when makes it incomplete. A comma splice joins two independent clauses with only a comma, while a run-on lacks a suitable boundary. Identify each clause first, then choose punctuation or a conjunction that expresses their relationship.",
                example: "“Because the path was flooded, we chose another route.” The dependent opening clause is completed by an independent clause.",
                tip: "Check whether each sentence has a complete subject–verb thought; repair fragments and run-ons."
            },
            "Grammar: Verb Tense": {
                explanation: "Verb tense signals when actions occur. Keep tense consistent unless the timeline gives a clear reason to shift.",
                lesson: "Use time words and surrounding verbs to place each action on a timeline. A passage may correctly shift tense when it moves from a past event to a present fact or a future plan; consistency does not mean every verb must match. Make sure a shift is intentional and that the sequence of events remains clear.",
                example: "“The class collected samples yesterday and will analyze them tomorrow.” The verbs match the stated timeline.",
                tip: "Mark the time of each action and keep the verbs aligned with that sequence."
            },
            "Rhetoric: Author Intent": {
                explanation: "An author's intent is the reason a passage or section was written, such as explaining a process, supporting a claim, or challenging an assumption.",
                lesson: "Purpose questions ask what a writer is trying to accomplish, not merely what subject the passage mentions. Look at the section's claims, examples, and placement in the passage. A paragraph might introduce a contrast, qualify an earlier claim, or provide evidence. Choose a purpose broad enough to cover the text but specific enough to describe its actual job.",
                example: "A paragraph that tests a popular explanation against new evidence is intended to evaluate that explanation.",
                tip: "Summarize what the author is doing with a verb—explaining, comparing, qualifying, or persuading."
            },
            "Rhetoric: Concision": {
                explanation: "The clearest revision expresses the intended meaning without repetition or needless wording. Shorter is not better if it removes an important idea.",
                lesson: "Look for repeated meanings, empty lead-ins, and phrases that can be replaced by a precise word. Then reread the entire sentence: a concise edit must preserve the facts, emphasis, and logical connections the writer needs. Avoid deleting a detail just because it makes the sentence shorter, and do not prefer a short answer that changes the intended meaning.",
                example: "“At this point in time” can become “now” when the meaning stays the same.",
                tip: "Remove a phrase only after checking that the revised sentence keeps every necessary detail."
            },
            "Rhetoric: Relevance": {
                explanation: "A detail belongs when it advances the paragraph's focus or supports its main point. Interesting information can still be irrelevant in context.",
                lesson: "State the paragraph's main point before judging a sentence. Ask whether the sentence explains, supports, or develops that point; a detail can be accurate and interesting yet still interrupt the argument. When an ACT question asks what to add or remove, evaluate its contribution to the paragraph rather than whether you personally like the information.",
                example: "In a paragraph about a bridge's design, a sentence about the engineer's unrelated hobby distracts from the focus.",
                tip: "State the paragraph's main point in a few words, then test each sentence against it."
            },
            "Rhetoric: Structure and Organization": {
                explanation: "Good organization gives ideas a logical order, such as sequence, cause and effect, problem and solution, or claim and evidence.",
                lesson: "Organization depends on how ideas relate, not just on the order in which they appear. Track whether the passage is explaining steps, comparing cases, moving from a problem to a response, or building a claim with evidence. For a sentence-placement question, read the sentences immediately before and after each possible location and check which order creates the clearest progression.",
                example: "A process explanation is easiest to follow when its steps appear in the order they happen.",
                tip: "Identify the relationship between neighboring paragraphs before deciding where a sentence belongs."
            },
            "Rhetoric: Tone": {
                explanation: "Tone is the author's attitude toward the subject, conveyed through word choice and emphasis. Support a tone label with language from the passage.",
                lesson: "Tone describes the writer's attitude, not whether the reader finds the topic exciting or important. Notice repeated word choices, qualifications, and judgments, then ask what attitude those choices convey. Prefer a precise description supported by the passage; extreme labels such as furious or delighted need stronger evidence than a mildly critical or cautious tone.",
                example: "Careful qualifications and measured claims suggest a cautious tone rather than an absolute one.",
                tip: "Notice repeated evaluative words and distinguish the author's attitude from the topic itself."
            },
            "Rhetoric: Transitions": {
                explanation: "A transition signals the logical relationship between ideas: contrast, addition, example, cause, or result.",
                lesson: "Do not choose a transition only because it sounds smooth. First describe the relationship between the idea before the blank and the idea after it. However signals contrast, for example introduces an instance, and therefore signals a result. Read the full sentence with the candidate inserted to confirm that its logic and punctuation both fit.",
                example: "“The first sample was too small; therefore, the team collected more data.” Therefore signals a result.",
                tip: "Describe the connection between the two ideas in your own words before choosing a transition."
            }
        },
        Math: {
            "Algebra: Define and Interpret Linear Function": {
                explanation: "A linear function changes at a constant rate and can be written as f(x) = mx + b, where m is the rate of change and b is the starting value.",
                lesson: "In f(x) = mx + b, m tells how much the output changes for each one-unit increase in the input, while b is the output when the input is zero. A table with a constant first difference or a straight-line graph can signal a linear relationship. Pay attention to what the input and output represent so the rate keeps its correct units.",
                example: "For f(x) = 3x − 2, f(4) = 3(4) − 2 = 10.",
                tip: "Substitute the input carefully and distinguish the rate from the starting value."
            },
            "Algebra: Exponential Functions": {
                explanation: "An exponential expression has the variable in the exponent. Repeated multiplication by a fixed factor creates exponential growth or decay.",
                lesson: "An exponential model often has the form a · b^x: a is the initial amount and b is the factor applied at each equal step. A factor greater than 1 gives growth; a positive factor less than 1 gives decay. Distinguish multiplying by a repeated factor from adding a fixed amount, which describes a linear pattern.",
                example: "In 5 · 2^t, the starting amount is 5 and the amount doubles for each increase of 1 in t.",
                tip: "Look for a repeated factor over equal steps; do not confuse it with adding a constant amount."
            },
            "Algebra: Inequalities": {
                explanation: "Solve an inequality much like an equation, but reverse its direction when multiplying or dividing both sides by a negative number.",
                lesson: "Adding or subtracting the same value on both sides preserves an inequality's direction, as does multiplying or dividing by a positive value. Multiplying or dividing by a negative reverses the order, because a negative number farther from zero becomes smaller. When a question asks for a graph or interval, include or exclude the endpoint according to the original symbol.",
                example: "−2x < 8 becomes x > −4 after dividing both sides by −2.",
                tip: "Circle any negative divisor or multiplier and reverse the inequality at that step."
            },
            "Algebra: Integers": {
                explanation: "Integer operations follow sign rules. For addition, combine magnitudes for like signs and subtract magnitudes for unlike signs.",
                lesson: "Think of a negative number as a position or a debt, not as a direction to ignore. For addition with opposite signs, compare magnitudes and keep the sign of the larger one; for multiplication and division, an odd number of negative factors gives a negative result and an even number gives a positive result. Apply order of operations before combining values.",
                example: "−7 + 12 = 5 because the positive amount exceeds the negative amount by 5.",
                tip: "Estimate the sign of the answer before calculating."
            },
            "Algebra: Manipulating Polynomials": {
                explanation: "Combine like terms and use the distributive property to expand or factor polynomial expressions.",
                lesson: "Like terms have the same variable part, including the same exponent, so 3x and 2x can combine but x and x² cannot. When distributing, multiply the outside factor by every term inside the parentheses, including negative terms. If factoring, reverse distribution and check by multiplying the factors back together.",
                example: "3x + 2(x − 4) = 3x + 2x − 8 = 5x − 8.",
                tip: "Distribute to every term inside parentheses, then combine only terms with matching variables and exponents."
            },
            "Algebra: Simplifying Exponents": {
                explanation: "Exponent rules describe repeated multiplication: multiply powers with the same base by adding exponents, and divide them by subtracting exponents.",
                lesson: "The product rule applies only to powers with the same base: x^a · x^b = x^(a+b). For a quotient with the same nonzero base, subtract exponents; a zero exponent gives 1 for a nonzero base, and a negative exponent means a reciprocal. Parentheses matter: (x²)³ is different from x² + 3.",
                example: "x³ · x² = x⁵, while x⁵ ÷ x² = x³ for nonzero x.",
                tip: "Use exponent rules only when the bases match, and keep track of negative exponents."
            },
            "Algebra: Solving Single Variable Equations": {
                explanation: "Use inverse operations to isolate the variable while keeping both sides balanced.",
                lesson: "Treat an equation like a balanced scale: any operation applied to one side must also be applied to the other. Undo addition or subtraction, then multiplication or division; simplify parentheses carefully and collect variable terms when they appear on both sides. Substitute the proposed solution into the original equation to catch sign and arithmetic errors.",
                example: "2x + 5 = 13 → 2x = 8 → x = 4.",
                tip: "Undo addition or subtraction before multiplication or division, then substitute to check."
            },
            "Algebra: Solving Systems of Linear Equations": {
                explanation: "A solution to a system makes every equation true. Substitution or elimination finds the point where the lines intersect.",
                lesson: "The solution is an ordered pair that satisfies both equations at once. Use substitution when one equation already isolates a variable; use elimination when adding or subtracting equations cancels a variable. After solving, check both coordinates in both original equations. Parallel lines may have no solution, while the same line written twice has infinitely many.",
                example: "For x + y = 11 and x − y = 3, add the equations to get 2x = 14; then x = 7 and y = 4.",
                tip: "Check the ordered pair in both original equations."
            },
            "Coordinate Geometry: Lines and Slopes": {
                explanation: "Slope measures vertical change per horizontal change: m = (y₂ − y₁)/(x₂ − x₁).",
                lesson: "Slope is a rate: for every horizontal change, it records the corresponding vertical change. A positive slope rises from left to right, a negative slope falls, a horizontal line has slope zero, and a vertical line has undefined slope. Keep each point's x- and y-coordinates paired and subtract in the same order to avoid reversing the sign.",
                example: "From (1, 2) to (3, 6), the slope is (6 − 2)/(3 − 1) = 2.",
                tip: "Subtract y-values and x-values in the same point order."
            },
            "Coordinate Geometry: Nonlinear Functions": {
                explanation: "A nonlinear function does not have a constant rate of change. Its graph may curve, and equal input steps can produce changing output differences.",
                lesson: "For equal steps in x, compare the changes in y. A constant first difference indicates a linear pattern; changing first differences show that the rate is not constant. Some quadratic patterns have constant second differences, but the question may only ask you to recognize that a straight-line model is not appropriate. Use the graph or table rather than guessing from one pair of points.",
                example: "For y = x², outputs at x = 1, 2, 3 are 1, 4, 9; the increases are not constant.",
                tip: "Compare successive output changes to decide whether a relationship is linear."
            },
            "Coordinate Geometry: Points": {
                explanation: "An ordered pair (x, y) locates a point by moving horizontally first and vertically second from the origin.",
                lesson: "The first coordinate always describes horizontal movement and the second describes vertical movement. Positive x moves right, negative x moves left; positive y moves up, negative y moves down. When reading a graph, check the scale and the axes before naming a point, because grid intervals do not always represent one unit.",
                example: "The point (−2, 3) is two units left and three units up.",
                tip: "Keep x and y in their stated order and check the signs against the quadrant."
            },
            "Data: Categorical Data and Probabilities": {
                explanation: "Categorical data sorts observations into groups. Probability is favorable outcomes divided by all equally likely outcomes.",
                lesson: "For equally likely outcomes, count how many outcomes satisfy the event and divide by the total number of possible outcomes. A probability cannot be below 0 or above 1. In two-way tables, identify whether the question asks for a row total, a column total, or a conditional probability restricted to one group.",
                example: "A bag with 3 red and 2 blue tiles has probability 3/5 of yielding red on one draw.",
                tip: "Count the full sample space and confirm that the probability is between 0 and 1."
            },
            "Data: Mean, Median, Mode, Standard Deviation": {
                explanation: "Mean is the arithmetic average, median is the middle ordered value, and mode is the most frequent value. Standard deviation describes spread around the mean.",
                lesson: "The mean uses every value, so a very large or small outlier can pull it. The median depends on the ordered middle value and is more resistant to extremes; with an even number of values, average the two middle entries. Standard deviation summarizes spread around the mean, so a larger value indicates more variation, not a higher average.",
                example: "For 2, 3, 3, 8, the mean is 4, the median is 3, and the mode is 3.",
                tip: "Sort the values before finding the median, and check whether an outlier shifts the mean."
            },
            "Geometry: Circles": {
                explanation: "A circle's radius runs from its center to its edge. Circumference is 2πr and area is πr².",
                lesson: "The diameter crosses the circle through its center and equals two radii. Use circumference when finding distance around the circle and area when finding the region inside it. Area squares the radius, while circumference uses it once; this difference is a frequent source of errors. Keep answers in terms of π unless the question requests a decimal.",
                example: "If the diameter is 10, the radius is 5 and the circumference is 10π.",
                tip: "Convert diameter to radius before using the area formula."
            },
            "Geometry: Lines and Angles": {
                explanation: "Angles on a straight line total 180°, angles around a point total 360°, and vertical angles are equal.",
                lesson: "Look for relationships before calculating: a linear pair is supplementary, vertical angles are congruent, and corresponding or alternate interior angles formed by parallel lines are equal. Mark the diagram with known values and relationships. Do not assume lines are parallel or a figure is drawn to scale unless the prompt states it.",
                example: "If one angle on a straight line is 68°, its adjacent angle is 112°.",
                tip: "Mark known equal or supplementary angles before solving."
            },
            "Geometry: Polygons": {
                explanation: "The interior angles of an n-sided polygon total (n − 2) × 180°. A regular polygon has equal sides and equal angles.",
                lesson: "The interior-angle sum formula works for any simple n-sided polygon. For a regular polygon, divide that sum by n to find one interior angle; this division is not valid when the angles differ. An exterior angle and its adjacent interior angle form a straight line, so they total 180 degrees.",
                example: "A pentagon's interior angle sum is (5 − 2) × 180° = 540°.",
                tip: "Count the sides carefully and distinguish the total angle sum from one angle."
            },
            "Geometry: Solid Geometry": {
                explanation: "Three-dimensional figures use formulas for volume and surface area. Track units: volume uses cubic units, while area uses square units.",
                lesson: "Volume measures the space inside a solid, while surface area measures the sum of its outer faces. Sketch the solid and label its dimensions before selecting a formula; a dimension may be a diameter, slant height, or perpendicular height. Check that the final units match the quantity: cubic for volume and square for area.",
                example: "A rectangular prism 2 by 3 by 4 has volume 2 × 3 × 4 = 24 cubic units.",
                tip: "Sketch and label the dimensions before choosing a formula."
            },
            "Geometry: Triangles": {
                explanation: "Triangle angles total 180°. Area is one-half base times height, and side relationships depend on the triangle type.",
                lesson: "The three interior angles always total 180 degrees. For area, the height must be perpendicular to the selected base, even when it falls outside an obtuse triangle. In a right triangle, the Pythagorean theorem relates the two legs and hypotenuse; identify the hypotenuse as the side opposite the right angle before substituting.",
                example: "A triangle with base 8 and perpendicular height 5 has area ½ × 8 × 5 = 20.",
                tip: "Use the perpendicular height—not a slanted side—in the area formula."
            },
            "Geometry: Trigonometry": {
                explanation: "In a right triangle, sine, cosine, and tangent relate an angle to side ratios: opposite/hypotenuse, adjacent/hypotenuse, and opposite/adjacent.",
                lesson: "Choose an acute reference angle first, then label the opposite side, adjacent side, and hypotenuse relative to that angle. The hypotenuse is always opposite the right angle; opposite and adjacent change when the reference angle changes. Match the known and unknown sides to sine, cosine, or tangent, and check that the calculator's angle mode matches the problem.",
                example: "For an angle with opposite side 3 and hypotenuse 5, sine of the angle is 3/5.",
                tip: "Label sides relative to the chosen angle before selecting a ratio."
            },
            "Function Notation": {
                explanation: "Function notation names an output. f(a) means evaluate the function rule using a as its input.",
                lesson: "Read f(x) as the output of a rule called f for the input x; it does not mean f multiplied by x. To evaluate f(3), replace each x in the rule with 3, using parentheses when the input is negative or an expression. Keep track of whether the problem asks for an input, an output, or a value that makes two outputs equal.",
                example: "If f(x) = 2x + 1, then f(3) = 2(3) + 1 = 7.",
                tip: "Treat the expression inside parentheses as the input; f is not multiplication."
            },
            "Matrices": {
                explanation: "Matrices organize values into rows and columns. Add or subtract matching positions; matrix multiplication requires compatible dimensions.",
                lesson: "A matrix's dimensions are rows by columns. Addition and subtraction require equal dimensions and operate entry by entry. For multiplication, the number of columns in the first matrix must equal the number of rows in the second; the result has the first matrix's row count and the second matrix's column count. Multiplication order generally matters.",
                example: "[[1, 2], [3, 4]] + [[4, 0], [−1, 2]] = [[5, 2], [2, 6]].",
                tip: "Check dimensions first and keep row and column positions aligned."
            },
            "Numbers: Sequences": {
                explanation: "A sequence follows a rule. Constant differences indicate an arithmetic sequence; constant ratios indicate a geometric sequence.",
                lesson: "Compare consecutive terms by subtraction first. A constant difference points to an arithmetic sequence; if differences vary, compare ratios for a geometric pattern. Once the rule is identified, use it to predict the requested term. Check the index carefully when a formula uses n, because the first term may correspond to n = 1 rather than n = 0.",
                example: "4, 7, 10, 13 has a constant difference of 3, so its next term is 16.",
                tip: "Compare differences first, then ratios if the differences are not constant."
            },
            "Rational and Irrational Numbers": {
                explanation: "Rational numbers can be written as a ratio of integers; irrational numbers cannot and have nonterminating, nonrepeating decimals.",
                lesson: "Integers, fractions, and terminating or repeating decimals are rational. A square root of a perfect square simplifies to an integer, while a root such as √2 is irrational. A decimal approximation does not make an irrational value exact. Simplify expressions before classifying them, and remember that sums or products of two irrational numbers are not always irrational.",
                example: "√9 = 3 is rational, while √2 is irrational.",
                tip: "Simplify radicals before deciding whether their values are rational."
            },
            "Rational Expressions": {
                explanation: "A rational expression is a ratio of polynomials. Factor and cancel common factors, while excluding values that make an original denominator zero.",
                lesson: "Factor the numerator and denominator completely, then cancel common factors rather than individual terms. Cancellation simplifies the expression but does not restore values that made the original denominator zero; record those restrictions before simplifying. If solving an equation with rational expressions, check candidate solutions in the original equation to reject any excluded value.",
                example: "(x² − 9)/(x − 3) simplifies to x + 3 only when x ≠ 3.",
                tip: "Factor completely and keep the original denominator's restrictions."
            },
            "Ratios and Proportions": {
                explanation: "A ratio compares quantities by division. Equivalent ratios scale every part by the same factor.",
                lesson: "Write the quantities in the order named and keep their units attached. A part-to-part ratio such as 3:5 has 8 total parts, while a part-to-whole ratio compares one amount with the total. For a proportion, scale both terms equally or cross-multiply, then check whether the result answers the requested quantity rather than the total.",
                example: "In a 3:5 mixture with 40 total parts, there are 8 ratio parts; each is 5, so the first amount is 15.",
                tip: "Keep units consistent and identify whether the question gives one part or the whole."
            }
        },
        Reading: {
            "Passage Overview": {
                explanation: "A passage overview captures the central subject and the author's main development of it without getting lost in minor details.",
                lesson: "An overview combines what the passage is mainly about with what the author does with that subject. Track the role of each paragraph—introducing a problem, describing a response, presenting evidence, or drawing a conclusion—then connect those roles into one concise summary. Avoid choices that focus on a single example or claim more than the passage establishes.",
                example: "If a passage describes a town restoring a river and then measures the results, its overview is the restoration effort and what it changed.",
                tip: "After each paragraph, note its role in a few words; use those notes to identify the passage's arc."
            },
            "Finding Key Details": {
                explanation: "A detail question asks for information stated in the passage. Return to the relevant lines and match the choice to the text.",
                lesson: "Treat detail questions as careful retrieval, not memory tests. Use a distinctive word from the question to find the relevant sentence, then reread enough context to confirm names, quantities, timing, and conditions. Choices may reuse passage vocabulary while changing one important relationship, so compare the choice with the text rather than selecting a familiar phrase.",
                example: "If the passage says the seedlings moved to a south-facing window, that location is a direct detail.",
                tip: "Search for a distinctive word from the question, then reread the surrounding sentence."
            },
            "Inference": {
                explanation: "An inference is a cautious conclusion supported by clues in the passage. It should not add assumptions the evidence cannot establish.",
                lesson: "An inference is not a guess about what usually happens; it is a conclusion that follows from the details provided. Combine the relevant clues, state the smallest conclusion they support, and compare each answer with that statement. Be wary of absolute language or extra causes, motives, and outcomes that the passage never confirms.",
                example: "A character checks a map and asks whether a bridge reopened, suggesting the route may depend on that bridge.",
                tip: "Combine two or more textual clues, then reject any choice that goes beyond them."
            },
            "Words and Phrases in Context": {
                explanation: "A word's meaning depends on how it is used in the sentence and passage, not only on its most familiar definition.",
                lesson: "Cover the tested word and read the sentence for its logical direction, tone, and surrounding details. Replace it with a simple phrase that fits, then test each answer in the original sentence. A word can have several valid dictionary meanings, but only one will preserve the author's meaning in this particular context.",
                example: "In “the analyst reserved judgment,” reserved means withheld rather than booked.",
                tip: "Replace the word with a simple synonym and see whether the sentence's meaning still fits."
            },
            "Analyzing Text Structure and Purpose": {
                explanation: "Structure questions ask how sections relate; purpose questions ask what a detail or paragraph contributes to the author's larger point.",
                lesson: "Separate a paragraph's topic from its function. It may define a term, present an exception, give evidence, answer an objection, or shift the discussion. Read the neighboring paragraphs to see what the passage needs at that point, then describe how the section advances the larger argument or explanation.",
                example: "A paragraph presenting new tracking data after a common theory may challenge or qualify that theory.",
                tip: "Describe the paragraph's job in relation to the one before it, not just its topic."
            }
        },
        Science: {
            "Basic Science": {
                explanation: "Science questions rely on the information provided, including definitions, procedures, and established relationships. Use the passage's evidence rather than outside assumptions.",
                lesson: "Scientific passages define the rules and conditions for the problem at hand. Identify what is being studied, how key terms are used, and which claims are observations versus interpretations. Apply the passage's definitions consistently; familiar real-world knowledge can be helpful, but it should not override a relationship or condition stated in the experiment.",
                example: "If a passage defines a mineral by hardness and luster, apply those stated criteria to the sample.",
                tip: "Locate the relevant definition or rule first and use it consistently."
            },
            "Fact Finding": {
                explanation: "Fact-finding questions ask you to retrieve a specific value or observation from a table, graph, or experiment description.",
                lesson: "Turn the question into a short lookup task: identify the variable, group, time, or trial it names, then locate that exact row and column. Read the axis scale before estimating and include the unit in your response. Nearby values can be distractors, so verify that both the condition and measurement match the question.",
                example: "If Trial 2 shows 14 units at hour 3, report that value—not a nearby trial's result.",
                tip: "Match the row, column, time, and units before reading the value."
            },
            "Interpreting Trends": {
                explanation: "A trend describes how a measured quantity changes as another quantity changes. Compare several data points before extending a pattern.",
                lesson: "Describe the relationship using both variables: as one increases, does the other rise, fall, or stay about the same? Compare more than two points and pay attention to scale, irregularities, and whether the rate appears constant. Extending a trend beyond the measured range is a prediction, not a directly observed fact.",
                example: "If output rises by 3 whenever input rises by 2, the next matching input step predicts an increase of 3.",
                tip: "State both what changes and the direction or rate of change."
            },
            "Calculations": {
                explanation: "Calculations combine values using the relationship stated in the prompt. Keep track of units and round only when needed.",
                lesson: "Before inserting numbers, decide what quantity is requested and write the relationship that connects the given values. Convert units first if they do not match, then calculate and check whether the size of the result is reasonable. Carry units through the work; they can reveal when a formula or division order is wrong.",
                example: "A 12-gram sample in 3 liters has concentration 12 ÷ 3 = 4 grams per liter.",
                tip: "Write the formula and units before substituting numbers."
            },
            "Experimental Design": {
                explanation: "A controlled experiment changes an independent variable, measures a dependent variable, and keeps other conditions consistent.",
                lesson: "The independent variable is deliberately changed; the dependent variable is measured in response. Other relevant conditions should be held constant so the comparison is meaningful. A control group provides a baseline, and repeated trials can reduce the influence of chance. Identify these roles before deciding whether a design tests its stated question.",
                example: "To test light and plant growth, vary the light exposure and keep plant type, soil, and measurement schedule the same.",
                tip: "Identify what is changed, what is measured, and what must stay constant."
            },
            "Hypothetical Changes": {
                explanation: "A hypothetical asks what would likely happen if a condition changed. Apply the passage's stated relationship while keeping other conditions fixed.",
                lesson: "Treat a hypothetical as a controlled change to the model described in the passage. Identify the changed factor, hold the other stated conditions constant, and follow the reported relationship in the correct direction. Make only the prediction supported by that relationship; do not assume a new mechanism or a guaranteed outcome.",
                example: "If a reaction slows at lower temperatures, the same results predict a slower reaction when temperature is reduced.",
                tip: "Change only the specified factor and avoid claiming more than the data supports."
            },
            "Interpreting Experiments": {
                explanation: "Interpret an experiment by comparing its treatment and control groups, identifying variables, and separating observations from explanations.",
                lesson: "Start with what the experiment actually measured, then compare the treatment group with its control under the stated conditions. A difference may support an association or a limited causal conclusion when the design controls other factors. It rarely proves a result applies to every species, setting, or future trial.",
                example: "If treated seeds sprout more often than untreated seeds under identical conditions, the treatment is associated with more sprouting.",
                tip: "Check whether the experiment actually tested the proposed cause before accepting a conclusion."
            },
            "Understanding Viewpoints": {
                explanation: "A viewpoint is a researcher's claim and supporting reasoning. Keep each researcher's evidence and conclusion distinct.",
                lesson: "For each researcher, identify the main claim and the observation or reasoning used to support it. Attribute statements carefully; a passage may report evidence that a researcher does not interpret in the same way. Summarizing each viewpoint in one sentence helps prevent transferring one researcher's claim to another.",
                example: "One researcher may attribute growth to rainfall, while another emphasizes soil composition.",
                tip: "Summarize each viewpoint in one sentence before comparing them."
            },
            "Comparing Viewpoints": {
                explanation: "Compare viewpoints by identifying what they agree on, where they differ, and which evidence supports each claim.",
                lesson: "Make a simple comparison: shared observations, different explanations, and evidence each researcher emphasizes. Two researchers can agree on a measurement while disagreeing about its cause or importance. Choose the statement that captures the precise relationship; avoid saying they agree or disagree about more than the passage shows.",
                example: "Two researchers may agree that a wetland stores water while disagreeing about whether that always prevents flooding.",
                tip: "Separate shared observations from contrasting explanations."
            }
        }
    };
}());
