
/* ==========================================
   WISH ROOM — BANNER & PULL SYSTEM
   ========================================== */

const WishRoom = {
    currentBanner: "featured",
    singleCost: 160,
    tenCost: 1600,

    init() {
        this.bindEvents();
        this.updateDisplay();
        this.renderRecentWishes();
    },

    bindEvents() {
        document.querySelectorAll("[data-banner]").forEach(button => {
            button.addEventListener("click", () => {
                this.currentBanner = button.dataset.banner;

                document.querySelectorAll("[data-banner]").forEach(tab => {
                    tab.classList.toggle(
                        "active",
                        tab.dataset.banner === this.currentBanner
                    );
                });

                this.updateDisplay();
            });
        });

        document.getElementById("singleWish")?.addEventListener(
            "click",
            () => this.makeWish(1)
        );

        document.getElementById("tenWish")?.addEventListener(
            "click",
            () => this.makeWish(10)
        );

        document.getElementById("closeWishResults")?.addEventListener(
            "click",
            () => this.closeResults()
        );

        document.getElementById("continueWish")?.addEventListener(
            "click",
            () => this.closeResults()
        );
    },

    makeWish(amount) {
        const cost = amount === 10 ? this.tenCost : this.singleCost;

        if (StudyArchive.data.crystals < cost) {
            alert("Not enough crystals! Complete study missions to earn more.");
            return;
        }

        StudyArchive.spendCrystals(cost);

        const results = amount === 10
            ? Gacha.pullTen(this.currentBanner)
            : [Gacha.pull(this.currentBanner)];

        this.showResults(results.filter(Boolean));
        this.updateDisplay();
        this.renderRecentWishes();
    },

    updateDisplay() {
        const crystals = StudyArchive.data.crystals;

        const balance = document.getElementById("wishCrystalBalance");
        if (balance) balance.textContent = crystals;

        const pity = document.getElementById("pityCounter");
        if (pity) pity.textContent = Gacha.getPity();

        const title = document.getElementById("wishBannerTitle");
        if (title) {
            title.textContent = this.currentBanner === "featured"
                ? "Whispers Beyond the Starlight"
                : "Wanderer's Archive";
        }
    },

    showResults(results) {
        const overlay = document.getElementById("wishResultOverlay");
        const grid = document.getElementById("wishResultsGrid");

        if (!overlay || !grid) return;

        grid.innerHTML = results.map(character => `
            <div class="wish-result-card rarity-${character.rarity.toLowerCase()}">
                <div class="result-image">
                    <img
                        src="${this.escapeHTML(character.image)}"
                        alt="${this.escapeHTML(character.name)}"
                        onerror="this.style.display='none'; this.parentElement.classList.add('no-image');"
                    >
                    <span class="result-rarity">${this.escapeHTML(character.rarity)}</span>
                </div>

                <div class="result-info">
                    <h3>${this.escapeHTML(character.name)}</h3>
                    <p>${this.escapeHTML(character.series)}</p>
                    <span>${this.escapeHTML(character.title)}</span>
                </div>
            </div>
        `).join("");

        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
    },

    closeResults() {
        const overlay = document.getElementById("wishResultOverlay");
        if (!overlay) return;

        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
    },

    renderRecentWishes() {
        const grid = document.getElementById("recentWishGrid");
        if (!grid) return;

        const history = Gacha.getHistory().slice(-4).reverse();

        if (!history.length) {
            grid.innerHTML = "<p class='empty-wishes'>Your wish history will appear here.</p>";
            return;
        }

        grid.innerHTML = history.map(entry => {
            const character = entry.character || entry;

            return `
                <div class="recent-wish-card rarity-${character.rarity.toLowerCase()}">
                    <div class="recent-wish-image">
                        <img
                            src="${this.escapeHTML(character.image)}"
                            alt="${this.escapeHTML(character.name)}"
                            onerror="this.style.display='none';"
                        >
                    </div>
                    <div>
                        <strong>${this.escapeHTML(character.name)}</strong>
                        <span>${this.escapeHTML(character.series)}</span>
                    </div>
                </div>
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
    if (window.Gacha && window.StudyArchive) {
        WishRoom.init();
    }
});
