/* Skill lesson browser with original mini checks and saved completion. */
(function () {
    "use strict";

    let activeSkillId = "";
    let activeCheckSkillId = "";
    let activeCheck = null;
    let currentQuizScore = null;
    let rewardMessage = "";

    const GUIDANCE = {
        English: "Read the whole sentence and the surrounding passage before choosing an edit. Identify what the question tests, then choose the clearest option that preserves the writer’s meaning and follows standard English conventions.",
        Math: "Write down the known quantities and what the question asks you to find. Choose a rule or equation that connects them, work carefully, and check that your result fits the original conditions.",
        Reading: "Use the passage as your evidence. Locate the relevant lines, separate what the author states from what you infer, and choose the option supported by those details.",
        Science: "Start with the question, then inspect the relevant experiment or data display. Check variables, units, labels, and comparisons before drawing a conclusion."
    };

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[character]);
    }

    function exampleFor(subject, skill) {
        const name = skill.toLowerCase();
        if (subject === "English") {
            if (name.includes("agreement")) return "The basket of apples is on the table. The verb agrees with basket, not the nearby plural apples.";
            if (name.includes("punctuation")) return "The clouds gathered; the hikers turned back. A semicolon joins two complete, closely related sentences.";
            if (name.includes("transitions")) return "I reviewed the evidence; therefore, I changed my conclusion. The transition shows a result.";
            if (name.includes("concision")) return "“At this point in time” can usually become “now.” Keep the meaning and remove needless words.";
            if (name.includes("pronoun")) return "Each student brought a notebook. Check that a pronoun clearly refers to the intended noun.";
            if (name.includes("verb tense")) return "Yesterday the team tested the model; today it analyzes the results. Keep time shifts intentional.";
            if (name.includes("parallel")) return "The plan is to measure, compare, and record. Matching verb forms make the list parallel.";
            return "Read the sentence before and after the edit. The strongest choice fits the grammar and supports the passage’s purpose.";
        }
        if (subject === "Math") {
            if (name.includes("matrix")) return "Add corresponding entries: [[1, 2], [3, 4]] + [[4, 0], [−1, 2]] = [[5, 2], [2, 6]].";
            if (name.includes("inequal")) return "3x − 5 < 7 → 3x < 12 → x < 4. Reverse the inequality only when multiplying or dividing by a negative.";
            if (name.includes("circle")) return "For a circle with radius 3, the area is πr² = 9π. Identify the radius before applying the formula.";
            if (name.includes("sequence")) return "In 4, 7, 10, 13, each term increases by 3. Check differences before deciding whether a pattern is arithmetic.";
            if (name.includes("ratio") || name.includes("proportion")) return "A ratio of 3:5 has 8 total parts. If the total is 40, one part is 5 and the first quantity is 15.";
            if (name.includes("slope") || name.includes("line")) return "Between (1, 2) and (3, 6), slope is (6 − 2)/(3 − 1) = 2. Keep the coordinate order consistent.";
            if (name.includes("equation")) return "For 2x + 5 = 13, subtract 5 from both sides, then divide by 2: x = 4.";
            return "Translate the information into a relationship, solve one step at a time, and substitute your answer back to check it.";
        }
        if (subject === "Reading") {
            return "Passage: “Mira checked the forecast, packed a raincoat, and left before dawn.” The passage supports that she expected possible rain and planned ahead; it does not prove that it rained.";
        }
        return "A table shows output rising from 4 to 7 to 10 as input rises from 2 to 4 to 6. The observed pattern is a steady increase of 3 output units for each 2 input units.";
    }

    function checkQuestion(subject, skill) {
        const topicQuestions = window.ACTQuestionBank?.filter(question =>
            question.subject === subject && question.skill === skill
        ) || [];
        if (topicQuestions.length) {
            const question = topicQuestions[Math.floor(Math.random() * topicQuestions.length)];
            return {
                prompt: question.prompt,
                options: question.options,
                answer: question.answer,
                explanation: question.explanation
            };
        }
        const methods = {
            English: "Read in context and check the relevant grammar rule or rhetorical purpose.",
            Math: "Identify the quantities and relationship, solve with valid steps, then check the result.",
            Reading: "Return to the passage and support the choice with relevant lines.",
            Science: "Check labels and variables, then match the conclusion to measured evidence."
        };
        const distractors = [
            "Choose the longest answer without checking the meaning.",
            "Use outside knowledge instead of the information in the question.",
            "Skip checking whether the answer fits the context."
        ];
        const options = [methods[subject], ...distractors];
        const shift = [...skill].reduce((total, character) => total + character.charCodeAt(0), 0) % options.length;
        const rotated = options.map((_, index) => options[(index + shift) % options.length]);
        return { prompt: `When a question tests ${skill}, which approach is the best starting point?`, options: rotated, answer: (options.length - shift) % options.length };
    }

    function lessonCounts(data) {
        return data.lessons.reduce((counts, lesson) => {
            if (!lesson.completed) return counts;
            const id = ACTData.skillId(lesson.subject, lesson.skill);
            counts[id] = (counts[id] || 0) + 1;
            return counts;
        }, {});
    }

    function renderList(data) {
        const subjectFilter = document.getElementById("lessonSubject").value;
        const search = document.getElementById("lessonSearch").value.trim().toLowerCase();
        const incompleteOnly = document.getElementById("showIncompleteOnly").checked;
        const counts = lessonCounts(data);
        const subjects = Object.keys(ACTData.SUBJECTS).filter(subject =>
            subjectFilter === "all" || subject === subjectFilter
        );
        const groups = subjects.map(subject => {
            const skills = ACTData.SUBJECTS[subject].filter(name => {
                const id = ACTData.skillId(subject, name);
                return name.toLowerCase().includes(search) &&
                    (!incompleteOnly || !counts[id]);
            });
            if (!skills.length) return "";
            return `
                <section class="lesson-subject-group">
                    <div class="lesson-subject-heading"><h2>${subject}</h2><span>${skills.length} skills</span></div>
                    ${skills.map(name => {
                        const id = ACTData.skillId(subject, name);
                        const skill = data.skills[id];
                        const completeCount = counts[id] || 0;
                        const level = skill ? ACTData.getSkillLevel(skill) : "Core";
                        return `<button type="button" class="lesson-skill-button" data-lesson-id="${id}" aria-current="${activeSkillId === id}">
                            <span class="lesson-skill-name">${escapeHTML(name)}</span>
                            <span class="lesson-skill-status ${completeCount ? "complete" : ""}">${completeCount ? `✓ ${completeCount}` : level}</span>
                        </button>`;
                    }).join("")}
                </section>`;
        }).join("");
        document.getElementById("lessonSkillList").innerHTML =
            groups || '<p class="lesson-empty">No skills match those filters.</p>';
    }

    function renderDetail(data) {
        const container = document.getElementById("lessonDetail");
        const skill = data.skills[activeSkillId];
        if (!skill) {
            container.innerHTML = '<div class="lesson-placeholder"><span class="lesson-placeholder-mark" aria-hidden="true">A</span><h2>Pick a skill to begin.</h2><p>Your lesson, example, and short check will open here.</p></div>';
            return;
        }
        if (activeCheckSkillId !== activeSkillId) {
            activeCheckSkillId = activeSkillId;
            activeCheck = checkQuestion(skill.subject, skill.name);
        }
        const content = activeCheck;
        const explainer = window.ACTTopicExplainers?.[skill.subject]?.[skill.name];
        const completed = data.lessons.filter(lesson =>
            lesson.completed && lesson.subject === skill.subject && lesson.skill === skill.name
        ).sort((a, b) => b.date.localeCompare(a.date));
        const latest = completed[0];
        const quizMarkup = currentQuizScore === null ? `
            <form id="lessonCheckForm">
                <fieldset class="lesson-check">
                    <legend>${escapeHTML(content.prompt)}</legend>
                    <div class="lesson-check-options">
                        ${content.options.map((option, index) => `<label class="lesson-check-option">
                            <input type="radio" name="lessonAnswer" value="${index}">
                            <span>${escapeHTML(option)}</span>
                        </label>`).join("")}
                    </div>
                    <div class="lesson-check-actions"><button class="act-button act-button-primary" type="submit">Check my understanding</button></div>
                    <p id="lessonFeedback" class="lesson-check-feedback" role="status" aria-live="polite"></p>
                </fieldset>
            </form>` : `
            <div class="lesson-check">
                <h3>Lesson check · ${currentQuizScore}%</h3>
                <p class="lesson-check-feedback">${currentQuizScore === 100 ? `Correct. ${escapeHTML(content.explanation || "Your lesson check is ready to save.")}` : `Review the approach: ${escapeHTML(content.explanation || content.options[content.answer])}`}</p>
                <div class="lesson-check-actions">
                    <button class="act-button act-button-primary" id="completeLessonButton" type="button">Mark lesson complete</button>
                    <button class="act-button" id="retryLessonButton" type="button">Try again</button>
                </div>
            </div>`;
        container.innerHTML = `
            <header class="lesson-detail-header">
                <div><span class="lesson-detail-subject">${escapeHTML(skill.subject)} · ${escapeHTML(ACTData.getSkillLevel(skill))} skill</span><h2>${escapeHTML(skill.name)}</h2></div>
                <span class="lesson-score-pill">${skill.score}/100</span>
            </header>
            <h3>Core idea</h3>
            <p class="lesson-detail-copy">${escapeHTML(explainer?.explanation || `${GUIDANCE[skill.subject]} This lesson focuses on ${skill.name}.`)}</p>
            ${explainer?.tip ? `<aside class="lesson-tip"><strong>Useful check</strong><p>${escapeHTML(explainer.tip)}</p></aside>` : ""}
            <h3>Worked example</h3>
            <div class="lesson-example">${escapeHTML(explainer?.example || exampleFor(skill.subject, skill.name))}</div>
            ${latest ? `<p class="lesson-completed-note">Completed ${new Date(`${latest.date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · last lesson check ${latest.score}%${data.crystalRewards.some(reward => reward.id === latest.id) ? ` · earned ${data.crystalRewards.find(reward => reward.id === latest.id).amount} crystals` : ""}.</p>` : ""}
            ${rewardMessage ? `<p class="lesson-reward-message" role="status">${escapeHTML(rewardMessage)}</p>` : ""}
            ${quizMarkup}`;
        const quizForm = document.getElementById("lessonCheckForm");
        quizForm?.addEventListener("submit", event => {
            event.preventDefault();
            const answer = new FormData(quizForm).get("lessonAnswer");
            if (answer === null) {
                const feedback = document.getElementById("lessonFeedback");
                feedback.textContent = "Choose an answer first.";
                feedback.classList.add("error");
                return;
            }
            currentQuizScore = Number(answer) === content.answer ? 100 : 0;
            render(ACTData.getState());
        });
        document.getElementById("completeLessonButton")?.addEventListener("click", () => {
            try {
                const score = currentQuizScore;
                currentQuizScore = null;
                const saved = ACTData.completeLesson(
                    skill.subject,
                    skill.name,
                    score,
                    Math.round((skill.score + score) / 2)
                );
                const lesson = saved.lessons.at(-1);
                try {
                    const reward = ACTData.awardCrystals(lesson.id, 15 + (score === 100 ? 10 : 0));
                    rewardMessage = `Lesson saved. You earned ${reward} crystals.`;
                } catch (error) {
                    rewardMessage = `Lesson saved, but crystals could not be added: ${error.message}`;
                }
                render(ACTData.getState());
            } catch (error) {
                rewardMessage = "";
                const message = document.createElement("p");
                message.className = "lesson-check-feedback error";
                message.textContent = error.message;
                container.appendChild(message);
            }
        });
        document.getElementById("retryLessonButton")?.addEventListener("click", () => {
            currentQuizScore = null;
            rewardMessage = "";
            render(ACTData.getState());
        });
    }

    function render(data) {
        renderList(data);
        renderDetail(data);
    }

    function init() {
        try {
            ACTData.init();
            const query = new URLSearchParams(window.location.search);
            const requestedSubject = query.get("subject");
            const requestedSkill = query.get("skill");
            if (requestedSubject && requestedSkill) {
                const requestedId = ACTData.skillId(requestedSubject, requestedSkill);
                if (ACTData.getState().skills[requestedId]) activeSkillId = requestedId;
            }
            render(ACTData.getState());
            ACTData.subscribe(render);
            document.getElementById("lessonSubject").addEventListener("change", () => render(ACTData.getState()));
            document.getElementById("lessonSearch").addEventListener("input", () => render(ACTData.getState()));
            document.getElementById("showIncompleteOnly").addEventListener("change", () => render(ACTData.getState()));
            document.getElementById("lessonSkillList").addEventListener("click", event => {
                const button = event.target.closest("[data-lesson-id]");
                if (!button) return;
                activeSkillId = button.dataset.lessonId;
                activeCheckSkillId = "";
                activeCheck = null;
                currentQuizScore = null;
                rewardMessage = "";
                render(ACTData.getState());
            });
        } catch (error) {
            document.getElementById("lessonDetail").textContent = error.message;
            console.error(error);
        }
    }

    document.addEventListener("DOMContentLoaded", init);
}());
