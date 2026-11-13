
/* ==========================================
   CHARACTER ARCHIVE SYSTEM
   ========================================== */

const CharacterArchive = {
    search: "",
    series: "all",
    rarity: "all",
    sort: "newest",
    lastDialogTrigger: null,

    init() {
        this.bindEvents();
        this.bindCharacterDialog();
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

        document.getElementById("characterGrid")
            ?.addEventListener("click", event => {
                const openButton = event.target.closest("[data-open-character-id]");
                if (openButton) {
                    this.openCharacter(openButton.dataset.openCharacterId, openButton);
                    return;
                }

                const button = event.target.closest("[data-level-up-id]");
                if (!button) return;

                try {
                    const character = this.getCharacters().find(
                        item => item.id === button.dataset.levelUpId
                    );
                    const result = Gacha.levelUpCard(button.dataset.levelUpId);
                    this.render();
                    this.showCardMessage(
                        `${character?.name || "Character"} reached level ${result.level}. ` +
                        `${this.frameName(result.level)} frame unlocked.`
                    );
                } catch (error) {
                    this.showCardMessage(error.message, true);
                }
            });
    },

    bindCharacterDialog() {
        const dialog = document.getElementById("characterDialog");
        document.getElementById("closeCharacterDialog")
            ?.addEventListener("click", () => dialog?.close());
        dialog?.addEventListener("click", event => {
            if (event.target === dialog) dialog.close();
        });
        dialog?.addEventListener("close", () => {
            this.lastDialogTrigger?.focus();
            this.lastDialogTrigger = null;
        });
    },

    getCharacters() {
        const history = Gacha.getHistory();
        const collected = new Map();

        history.forEach((entry, index) => {
            const character = entry.character || entry;

            if (!character.id) return;

            if (!collected.has(character.id)) {
                const profile = Gacha.characters.find(item => item.id === character.id);
                collected.set(character.id, {
                    ...profile,
                    ...character,
                    description: character.description || profile?.description ||
                        `${character.name} is a character from ${character.series}.`,
                    obtainedAt: entry.obtainedAt || "",
                    count: 1,
                    firstIndex: index
                });
            } else {
                const saved = collected.get(character.id);
                saved.count++;
                if (!saved.description) {
                    const profile = Gacha.characters.find(item => item.id === character.id);
                    saved.description = profile?.description ||
                        `${character.name} is a character from ${character.series}.`;
                }
            }
        });

        return Array.from(collected.values()).map(character => {
            const level = Gacha.getCardLevel(character.id);
            return {
                ...character,
                level,
                duplicatesAvailable: Math.max(0, character.count - level)
            };
        });
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
            <article class="character-card rarity-${this.escapeHTML(character.rarity.toLowerCase())} frame-level-${character.level}">
                <div class="character-card-inner">
                    <div class="character-art">
                        <img
                            src="${this.escapeHTML(character.image)}"
                            alt="${this.escapeHTML(character.name)}"
                            onerror="this.style.display='none'; this.parentElement.classList.add('no-image');"
                        >
                        <span class="character-rarity">
                            ${this.escapeHTML(character.rarity)}
                        </span>
                        <span class="character-frame-label">${this.frameName(character.level)} FRAME</span>
                    </div>

                    <div class="character-details">
                        <div class="character-title-row">
                            <h3>${this.escapeHTML(character.name)}</h3>
                            <span class="character-level">LV ${character.level}/${Gacha.maxCardLevel}</span>
                        </div>
                        <p>${this.escapeHTML(character.series)}</p>
                        <span>${this.escapeHTML(character.title)}</span>
                        <p class="character-copies">
                            ${character.count} ${character.count === 1 ? "copy" : "copies"} owned
                            <span>· ${character.duplicatesAvailable} ${character.duplicatesAvailable === 1 ? "duplicate" : "duplicates"} available</span>
                        </p>
                    </div>

                    <div class="character-card-actions">
                        <button class="character-open-card" type="button"
                            data-open-character-id="${this.escapeHTML(character.id)}"
                            aria-label="Open ${this.escapeHTML(character.name)} character details">
                            Open character
                        </button>
                        <button class="character-level-up" type="button"
                            data-level-up-id="${this.escapeHTML(character.id)}"
                            ${character.duplicatesAvailable < 1 || character.level >= Gacha.maxCardLevel ? "disabled" : ""}
                            aria-label="Level up ${this.escapeHTML(character.name)} using one duplicate">
                            ${character.level >= Gacha.maxCardLevel
                                ? "Max level reached"
                                : character.duplicatesAvailable > 0
                                    ? "Level up · 1 duplicate"
                                    : "Need 1 duplicate"}
                        </button>
                    </div>
                </div>
            </article>
        `).join("");
    },

    openCharacter(characterId, trigger) {
        const character = this.getCharacters().find(item => item.id === characterId);
        const dialog = document.getElementById("characterDialog");
        const content = document.getElementById("characterDialogContent");
        if (!character || !dialog || !content) {
            this.showCardMessage("Character details could not be opened.", true);
            return;
        }

        const obtained = character.obtainedAt
            ? new Date(character.obtainedAt).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric"
            })
            : "Date not recorded";
        content.innerHTML = `
            <div class="character-dialog-art rarity-${this.escapeHTML(character.rarity.toLowerCase())}">
                <img src="${this.escapeHTML(character.image || Gacha.getImage(character))}"
                    alt="${this.escapeHTML(character.name)}"
                    onerror="this.style.display='none'; this.parentElement.classList.add('no-image');">
                <span class="character-dialog-rarity">${this.escapeHTML(character.rarity)}</span>
                <span class="character-dialog-frame">${this.frameName(character.level)} frame</span>
            </div>
            <div class="character-dialog-details">
                <p class="character-dialog-series">${this.escapeHTML(character.series)}</p>
                <h2 id="characterDialogName">${this.escapeHTML(character.name)}</h2>
                <p class="character-dialog-title">${this.escapeHTML(character.title || "Character Archive")}</p>
                <p class="character-dialog-description">${this.escapeHTML(character.description)}</p>
                <dl class="character-dialog-facts">
                    <div><dt>Card level</dt><dd>${character.level} / ${Gacha.maxCardLevel} · ${this.frameName(character.level)} frame</dd></div>
                    <div><dt>Rarity</dt><dd>${this.escapeHTML(character.rarity)}</dd></div>
                    <div><dt>Copies owned</dt><dd>${character.count}</dd></div>
                    <div><dt>Duplicates available</dt><dd>${character.duplicatesAvailable}</dd></div>
                    <div><dt>First discovered</dt><dd>${this.escapeHTML(obtained)}</dd></div>
                </dl>
            </div>`;
        this.lastDialogTrigger = trigger;
        dialog.showModal();
        document.getElementById("closeCharacterDialog").focus();
    },

    frameName(level) {
        return ["", "Archive", "Bronze", "Silver", "Gold", "Starlight"][level] || "Archive";
    },

    showCardMessage(message, isError = false) {
        const element = document.getElementById("cardActionMessage");
        if (!element) return;
        element.textContent = message;
        element.classList.toggle("error", isError);
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
