/* Search, bookmarking, and personal entries for the ACT strategy library. */
(function () {
    "use strict";

    const SUBJECTS = ["English", "Math", "Reading", "Science"];
    const BUILT_IN_STRATEGIES = [
        {
            id: "english-revise-for-purpose",
            subject: "English",
            title: "Revise for the sentence’s purpose",
            explanation: "Before choosing an edit, read the surrounding sentence and ask what it needs to accomplish. Prefer the option that communicates that purpose clearly and fits the passage.",
            tips: "Read one sentence before and after the underlined portion; keep the passage’s main point in view.",
            example: "If a sentence introduces a contrast, choose a transition that signals contrast rather than simply adding another idea.",
            mistakes: "Choosing an edit because it sounds formal, even when it changes the meaning or adds unnecessary words."
        },
        {
            id: "english-check-agreement",
            subject: "English",
            title: "Find the subject before checking agreement",
            explanation: "Ignore phrases between a subject and its verb while you check whether they agree. The nearest noun is not always the subject.",
            tips: "Temporarily cover prepositional phrases and descriptive clauses to reveal the sentence’s core.",
            example: "“The collection of essays is…” — collection is singular, even though essays is plural.",
            mistakes: "Matching the verb to a nearby noun inside an interrupting phrase."
        },
        {
            id: "math-translate-then-solve",
            subject: "Math",
            title: "Translate the relationship before solving",
            explanation: "Define a variable, write an equation or inequality from the relationships in the problem, then solve and check the result against the original question.",
            tips: "Keep units with your quantities, and note what the question asks you to find.",
            example: "“Five more than twice a number” becomes 2x + 5, not 2(x + 5).",
            mistakes: "Doing arithmetic from the story before deciding what each quantity represents."
        },
        {
            id: "math-estimate-and-check",
            subject: "Math",
            title: "Estimate before trusting an answer",
            explanation: "Use a quick estimate to predict the sign, size, or range of the result. Compare answer choices to that prediction before spending time on exact computation.",
            tips: "Substitute a simple nearby value when a complicated expression makes estimation easier.",
            example: "If a length is about 10 and a width about 4, an area near 40 is more plausible than 400.",
            mistakes: "Accepting a precisely calculated value without checking whether it fits the situation."
        },
        {
            id: "reading-evidence-first",
            subject: "Reading",
            title: "Anchor each answer in the passage",
            explanation: "For detail and inference questions, locate the relevant lines first. Select the choice best supported by that evidence, not the one that sounds most reasonable in general.",
            tips: "Restate the evidence in your own words before looking at the options.",
            example: "If the passage says a researcher postponed a study, do not infer that the researcher abandoned it.",
            mistakes: "Using outside knowledge or extending a small clue into a claim the passage never makes."
        },
        {
            id: "reading-purpose-map",
            subject: "Reading",
            title: "Track what each paragraph contributes",
            explanation: "As you read, briefly note each paragraph’s role: introduce, explain, contrast, give an example, or conclude. This makes structure and purpose questions easier to navigate.",
            tips: "Keep notes to a few words so annotation supports reading rather than interrupting it.",
            example: "A paragraph that begins with an opposing view and ends with a response may serve as a counterargument.",
            mistakes: "Summarizing every detail instead of identifying how the paragraph advances the passage."
        },
        {
            id: "science-read-question-first",
            subject: "Science",
            title: "Read the question before the data display",
            explanation: "Identify the variables and comparison the question asks about, then go to the relevant table, graph, or experiment. This keeps you focused on the evidence you need.",
            tips: "Check axis labels, units, and legend before comparing values.",
            example: "For a question about temperature and growth, find those labels first instead of scanning every column.",
            mistakes: "Mixing up independent and dependent variables or overlooking a change in units."
        },
        {
            id: "science-separate-observation-claim",
            subject: "Science",
            title: "Separate what was observed from what was inferred",
            explanation: "Distinguish a directly reported result from an explanation of why it happened. Choose conclusions that the experiment or data actually supports.",
            tips: "Ask whether the result was measured, or whether the answer adds a possible cause.",
            example: "A faster reaction in one trial is an observation; the reason for the speed difference may need more evidence.",
            mistakes: "Treating a plausible explanation as proven when the experiment did not test it."
        }
    ];

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function render(data) {
        const searchTerm = document.getElementById("strategySearch").value.trim().toLowerCase();
        const subject = document.getElementById("subjectFilter").value;
        const bookmarksOnly = document.getElementById("bookmarksOnly").checked;
        const strategies = [
            ...BUILT_IN_STRATEGIES,
            ...data.strategies.map(strategy => ({ ...strategy, personal: true }))
        ];
        const matching = strategies.filter(strategy => {
            if (subject !== "all" && strategy.subject !== subject) return false;
            if (bookmarksOnly && !data.bookmarks.includes(strategy.id)) return false;
            const searchable = [
                strategy.subject, strategy.title, strategy.explanation,
                strategy.tips, strategy.example, strategy.mistakes
            ].join(" ").toLowerCase();
            return searchable.includes(searchTerm);
        });

        document.getElementById("strategyCount").textContent =
            `${matching.length} ${matching.length === 1 ? "strategy" : "strategies"}`;
        const container = document.getElementById("strategyList");
        if (!matching.length) {
            container.innerHTML = '<p class="strategy-empty">No strategies match those filters. Try another subject or search term.</p>';
            return;
        }

        container.innerHTML = matching.map(strategy => {
            const bookmarked = data.bookmarks.includes(strategy.id);
            const details = [
                ["Tips", strategy.tips],
                ["Example", strategy.example],
                ["Common mistake", strategy.mistakes]
            ].filter(([, text]) => text).map(([label, text]) => `
                <div class="strategy-detail">
                    <strong>${label}</strong>
                    <p>${escapeHTML(text)}</p>
                </div>`).join("");
            return `
                <article class="strategy-card ${strategy.subject.toLowerCase()}">
                    <div class="strategy-card-top">
                        <span class="strategy-subject">${escapeHTML(strategy.subject)}</span>
                        ${strategy.personal ? '<span class="strategy-personal">YOUR NOTE</span>' : ""}
                        <button class="strategy-bookmark" type="button" data-strategy-id="${escapeHTML(strategy.id)}"
                            aria-pressed="${bookmarked}" aria-label="${bookmarked ? "Remove bookmark from" : "Bookmark"} ${escapeHTML(strategy.title)}">
                            ${bookmarked ? "★" : "☆"}
                        </button>
                    </div>
                    <h3>${escapeHTML(strategy.title)}</h3>
                    <p class="strategy-explanation">${escapeHTML(strategy.explanation)}</p>
                    ${details}
                </article>`;
        }).join("");
    }

    function showMessage(text, isError = false) {
        const message = document.getElementById("strategyMessage");
        message.textContent = text;
        message.classList.toggle("error", isError);
    }

    function init() {
        try {
            ACTData.init();
            const form = document.getElementById("strategyForm");
            const refresh = () => render(ACTData.getState());
            ACTData.subscribe(refresh);
            refresh();

            document.getElementById("strategySearch").addEventListener("input", refresh);
            document.getElementById("subjectFilter").addEventListener("change", refresh);
            document.getElementById("bookmarksOnly").addEventListener("change", refresh);
            document.getElementById("strategyList").addEventListener("click", event => {
                const button = event.target.closest("[data-strategy-id]");
                if (!button) return;
                try {
                    ACTData.toggleStrategyBookmark(button.dataset.strategyId);
                } catch (error) {
                    showMessage(error.message, true);
                }
            });

            form.addEventListener("submit", event => {
                event.preventDefault();
                const values = new FormData(form);
                try {
                    ACTData.addStrategy({
                        subject: values.get("subject"),
                        title: values.get("title"),
                        explanation: values.get("explanation"),
                        tips: values.get("tips"),
                        example: values.get("example"),
                        mistakes: values.get("mistakes")
                    });
                    form.reset();
                    showMessage("Your strategy has been saved.");
                } catch (error) {
                    showMessage(error.message, true);
                }
            });
        } catch (error) {
            showMessage(error.message, true);
            console.error(error);
        }
    }

    document.addEventListener("DOMContentLoaded", init);
}());
