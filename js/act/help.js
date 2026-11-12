/* Searchable ACT Study Center help topics. */
(function () {
    "use strict";

    function init() {
        const search = document.getElementById("helpSearch");
        const topics = [...document.querySelectorAll(".help-item")];
        const count = document.getElementById("helpCount");
        const empty = document.getElementById("helpNoResults");

        function filter() {
            const query = search.value.trim().toLowerCase();
            let visible = 0;
            topics.forEach(topic => {
                const matches = topic.textContent.toLowerCase().includes(query);
                topic.hidden = !matches;
                if (matches) visible++;
            });
            count.textContent = `${visible} ${visible === 1 ? "topic" : "topics"}`;
            empty.hidden = visible > 0;
        }

        search.addEventListener("input", filter);
        filter();
    }

    document.addEventListener("DOMContentLoaded", init);
}());
