
/* ==========================================
   CHARACTER ARCHIVE SYSTEM
   ========================================== */

const CharacterArchive = {
    search: "",
    series: "all",
    rarity: "all",
    sort: "newest",

    init() {
        this.bindEvents();
        this.render();
    },

    bindEvents() {
        document.getElementById("characterSearch")
            ?.addEventListener("input", event => {
                this.search = event.target.value.toLowerCase();
                this.render();
            });

        document.getElementById("seriesFilter")
            ?.addEventListener("change", event => {
                this.series = event.target.value;
                this.render();
            });

        document.getElementById("rarityFilter")
            ?.addEventListener("change", event => {
                this.rarity = event.target.value;
                this.render();
            });

        document.getElementById("characterSort")
            ?.addEventListener("change", event => {
                this.sort = event.target.value;
                this.render();
            });
    },

    getCharacters() {
        const history = Gacha.getHistory();
        const collected = new Map();

        history.forEach((entry, index) => {
            const character = entry.character || entry;

            if (!character.id) return;

            if (!collected.has(character.id)) {
                collected.set(character.id, {
                    ...character,
                    obtainedAt: entry.obtainedAt || "",
                    count: 1,
                    firstIndex: index
                });
            } else {
                collected.get(character.id).count++;
            }
        });

        return Array.from(collected.values());
    },

    render() {
        const characters = this.getCharacters();

        this.updateStats(characters);

        let filtered = characters.filter(character => {
            const matchesSearch =
                character.name.toLowerCase().includes(this.search) ||
                character.series.toLowerCase().includes(this.search) ||
                character.title.toLowerCase().includes(this.search);

            const matchesSeries =
                this.series === "all" ||
                character.series === this.series;

            const matchesRarity =
                this.rarity === "all" ||
                character.rarity === this.rarity;

            return matchesSearch && matchesSeries && matchesRarity;
        });

        if (this.sort === "name") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (this.sort === "rarity") {
            const order = { SSR: 3, SR: 2, R: 1 };
            filtered.sort((a, b) =>
                order[b.rarity] - order[a.rarity]
            );
        } else {
            filtered.sort((a, b) => b.firstIndex - a.firstIndex);
        }

        this.renderGrid(filtered);
    },

    updateStats(characters) {
        document.getElementById("characterCount").textContent =
            characters.length;

        document.getElementById("ssrCount").textContent =
            characters.filter(c => c.rarity === "SSR").length;

        document.getElementById("srCount").textContent =
            characters.filter(c => c.rarity === "SR").length;

        document.getElementById("seriesCount").textContent =
            new Set(characters.map(c => c.series)).size;

        document.getElementById("showingCount").textContent =
            `${characters.length} characters collected`;
    },

    renderGrid(characters) {
        const grid = document.getElementById("characterGrid");
        const showing = document.getElementById("showingCount");

        if (!grid) return;

        if (showing) {
            showing.textContent = `${characters.length} characters shown`;
        }

        if (!characters.length) {
            grid.innerHTML = `
                <div class="empty-collection">
                    <i data-lucide="library" aria-hidden="true"></i>
                    <h3>No characters found</h3>
                    <p>Try changing your search or filters.</p>
                </div>
            `;
            window.lucide?.createIcons();
            return;
        }

        grid.innerHTML = characters.map(character => `
            <article class="character-card rarity-${this.escapeHTML(character.rarity.toLowerCase())}">
                <div class="character-art">
                    <img
                        src="${this.escapeHTML(character.image)}"
                        alt="${this.escapeHTML(character.name)}"
                        onerror="this.style.display='none'; this.parentElement.classList.add('no-image');"
                    >
                    <span class="character-rarity">
                        ${this.escapeHTML(character.rarity)}
                    </span>
                </div>

                <div class="character-details">
                    <h3>${this.escapeHTML(character.name)}</h3>
                    <p>${this.escapeHTML(character.series)}</p>
                    <span>${this.escapeHTML(character.title)}</span>
                    ${character.count > 1
                        ? `<p>Owned ×${character.count}</p>`
                        : ""}
                </div>
            </article>
        `).join("");
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
        CharacterArchive.init();
    }
});
