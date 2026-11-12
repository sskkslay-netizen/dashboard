
/* ==========================================
   WISH HISTORY SYSTEM
   ========================================== */

const WishHistory = {
    search: "",
    rarity: "all",
    series: "all",

    init() {
        this.bindEvents();
        this.render();
    },

    bindEvents() {
        document.getElementById("historySearch")
            ?.addEventListener("input", event => {
                this.search = event.target.value.toLowerCase();
                this.render();
            });

        document.getElementById("historyRarity")
            ?.addEventListener("change", event => {
                this.rarity = event.target.value;
                this.render();
            });

        document.getElementById("historySeries")
            ?.addEventListener("change", event => {
                this.series = event.target.value;
                this.render();
            });
    },

    getRecords() {
        return Gacha.getHistory().slice().reverse();
    },

    render() {
        const records = this.getRecords();

        document.getElementById("totalPulls").textContent =
            Gacha.getTotalPulls();

        document.getElementById("historySSR").textContent =
            records.filter(r => (r.character || r).rarity === "SSR").length;

        document.getElementById("historySR").textContent =
            records.filter(r => (r.character || r).rarity === "SR").length;

        document.getElementById("historyR").textContent =
            records.filter(r => (r.character || r).rarity === "R").length;

        const filtered = records.filter(record => {
            const character = record.character || record;

            const matchesSearch =
                character.name.toLowerCase().includes(this.search) ||
                character.series.toLowerCase().includes(this.search);

            const matchesRarity =
                this.rarity === "all" ||
                character.rarity === this.rarity;

            const matchesSeries =
                this.series === "all" ||
                character.series === this.series;

            return matchesSearch && matchesRarity && matchesSeries;
        });

        this.renderList(filtered);
    },

    renderList(records) {
        const container = document.getElementById("wishHistoryList");
        if (!container) return;

        document.getElementById("historyShowing").textContent =
            `${records.length} wishes`;

        if (!records.length) {
            container.innerHTML = `
                <div class="empty-collection">
                    <i data-lucide="history" aria-hidden="true"></i>
                    <h3>No matching wishes</h3>
                    <p>Try changing your search or filters.</p>
                </div>
            `;
            window.lucide?.createIcons();
            return;
        }

        container.innerHTML = records.map((record, index) => {
            const character = record.character || record;
            const date = record.obtainedAt
                ? new Date(record.obtainedAt).toLocaleString()
                : "Date unavailable";

            return `
                <article class="history-card rarity-${this.escapeHTML(character.rarity.toLowerCase())}">
                    <div class="history-art">
                        <img
                            src="${this.escapeHTML(character.image)}"
                            alt="${this.escapeHTML(character.name)}"
                            onerror="this.style.display='none'; this.parentElement.classList.add('no-image');"
                        >
                    </div>

                    <div class="history-details">
                        <span class="history-rarity">
                            ${this.escapeHTML(character.rarity)}
                        </span>
                        <h3>${this.escapeHTML(character.name)}</h3>
                        <p>${this.escapeHTML(character.series)}</p>
                        <small>${this.escapeHTML(character.title)}</small>
                    </div>

                    <div class="history-date">
                        <span>Wish #${records.length - index}</span>
                        <small>${this.escapeHTML(date)}</small>
                    </div>
                </article>
            `;
        }).join("");
    },

    escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    if (window.Gacha) {
        WishHistory.init();
    }
});
