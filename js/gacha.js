
/* ==========================================
   STUDY ARCHIVE — MULTI-SERIES GACHA ENGINE
========================================== */

const Gacha = {

    // ======================================
    // CHARACTER DATABASE
    // Add new characters inside this array!
    // ======================================

    characters: [

        // BUNGOU STRAY DOGS
        {
            id: "bsd_dazai",
            name: "Osamu Dazai",
            series: "Bungou Stray Dogs",
            rarity: "SSR",
            title: "No Longer Human",
            image: "../assets/characters/bsd_dazai.PNG"
        },
        {
            id: "bsd_chuuya",
            name: "Chuuya Nakahara",
            series: "Bungou Stray Dogs",
            rarity: "SSR",
            title: "Upon the Tainted Sorrow",
            image: "../assets/characters/bsd_chuuya.PNG"
        },
        {
            id: "bsd_ranpo",
            name: "Ranpo Edogawa",
            series: "Bungou Stray Dogs",
            rarity: "SR",
            title: "Super Deduction",
            image: "../assets/characters/bsd_ranpo.PNG"
        },
        {
            id: "bsd_atsushi",
            name: "Atsushi Nakajima",
            series: "Bungou Stray Dogs",
            rarity: "SR",
            title: "Beast Beneath the Moonlight",
            image: "../assets/characters/bsd_atsushi.PNG"
        },
        {
            id: "bsd_akutagawa",
            name: "Ryunosuke Akutagawa",
            series: "Bungou Stray Dogs",
            rarity: "SSR",
            title: "Rashomon",
            image: "../assets/characters/bsd_akutagawa.PNG"
        },
        {
            id: "bsd_kunikida",
            name: "Doppo Kunikida",
            series: "Bungou Stray Dogs",
            rarity: "SR",
            title: "Ideal",
            image: "../assets/characters/bsd_kunikida.PNG"
        },
        {
            id: "bsd_yosano",
            name: "Akiko Yosano",
            series: "Bungou Stray Dogs",
            rarity: "SR",
            title: "Thou Shalt Not Die",
            image: "../assets/characters/bsd_yosano.PNG"
        },
        {
            id: "bsd_fyodor",
            name: "Fyodor Dostoevsky",
            series: "Bungou Stray Dogs",
            rarity: "SSR",
            title: "Crime and Punishment",
            image: "../assets/characters/bsd_fyodor.PNG"
        },
        {
            id: "bsd_kenji",
            name: "Kenji Miyazaki",
            series: "Bungou Stray Dogs",
            rarity: "SSR",
            title: "The Undefeated by the Rain",
            image: "../assets/characters/bsd_kenji.PNG"
        },

        // DEMON SLAYER
        {
            id: "kny_tanjiro",
            name: "Tanjiro Kamado",
            series: "Demon Slayer",
            rarity: "SSR",
            title: "Hinokami Kagura",
            image: "../assets/characters/kny-tanjiro.PNG"
        },
        {
            id: "kny_nezuko",
            name: "Nezuko Kamado",
            series: "Demon Slayer",
            rarity: "SSR",
            title: "Demon Form",
            image: "../assets/characters/kny-nezuko.PNG"
        },
        {
            id: "kny_zenitsu",
            name: "Zenitsu Agatsuma",
            series: "Demon Slayer",
            rarity: "SR",
            title: "Thunder Breathing",
            image: "../assets/characters/kny-zenitsu.PNG"
        },
        {
            id: "kny_inosuke",
            name: "Inosuke Hashibira",
            series: "Demon Slayer",
            rarity: "SR",
            title: "Beast Breathing",
            image: "../assets/characters/kny-inosuke.PNG"
        },
        {
            id: "kny_giyu",
            name: "Giyu Tomioka",
            series: "Demon Slayer",
            rarity: "SSR",
            title: "Water Hashira",
            image: "../assets/characters/kny-giyu.PNG"
        },
        {
            id: "kny_shinobu",
            name: "Shinobu Kocho",
            series: "Demon Slayer",
            rarity: "SSR",
            title: "Insect Hashira",
            image: "../assets/characters/kny-shinobu.PNG"
        },
        {
            id: "kny_rengoku",
            name: "Kyojuro Rengoku",
            series: "Demon Slayer",
            rarity: "SSR",
            title: "Flame Hashira",
            image: "../assets/characters/kny-rengoku.PNG"
        },
        {
            id: "kny_mitsuri",
            name: "Mitsuri Kanroji",
            series: "Demon Slayer",
            rarity: "SR",
            title: "Love Hashira",
            image: "../assets/characters/kny-mitsuri.PNG"
        },

        // MY HERO ACADEMIA
        {
            id: "mha_deku",
            name: "Izuku Midoriya",
            series: "My Hero Academia",
            rarity: "SSR",
            title: "One For All",
            image: "../assets/characters/mha-deku.PNG"
        },
        {
            id: "mha_bakugo",
            name: "Katsuki Bakugo",
            series: "My Hero Academia",
            rarity: "SSR",
            title: "Explosion",
            image: "../assets/characters/mha-bakugo.PNG"
        },
        {
            id: "mha_todoroki",
            name: "Shoto Todoroki",
            series: "My Hero Academia",
            rarity: "SSR",
            title: "Half-Cold Half-Hot",
            image: "../assets/characters/mha-todoroki.PNG"
        },
        {
            id: "mha_uraraka",
            name: "Ochaco Uraraka",
            series: "My Hero Academia",
            rarity: "SR",
            title: "Zero Gravity",
            image: "../assets/characters/mha-uraraka.PNG"
        },
        {
            id: "mha_aizawa",
            name: "Shota Aizawa",
            series: "My Hero Academia",
            rarity: "SR",
            title: "Erasure",
            image: "../assets/characters/mha-aizawa.PNG"
        },
        {
            id: "mha_dabi",
            name: "Dabi",
            series: "My Hero Academia",
            rarity: "SSR",
            title: "Blueflame",
            image: "../assets/characters/mha-dabi.PNG"
        },
        {
            id: "mha_hawks",
            name: "Hawks",
            series: "My Hero Academia",
            rarity: "SR",
            title: "Fierce Wings",
            image: "../assets/characters/mha-hawks.PNG"
        },

        // ALIEN STAGE
        {
            id: "alnst_mizi",
            name: "Mizi",
            series: "Alien Stage",
            rarity: "SSR",
            title: "The Brightest Star",
            image: "../assets/characters/alnst-mizi.PNG"
        },
        {
            id: "alnst_sua",
            name: "Sua",
            series: "Alien Stage",
            rarity: "SSR",
            title: "A Quiet Melody",
            image: "../assets/characters/alnst-sua.PNG"
        },
        {
            id: "alnst_till",
            name: "Till",
            series: "Alien Stage",
            rarity: "SSR",
            title: "The Rebel Musician",
            image: "../assets/characters/alnst-till.PNG"
        },
        {
            id: "alnst_ivan",
            name: "Ivan",
            series: "Alien Stage",
            rarity: "SSR",
            title: "The Silent Observer",
            image: "../assets/characters/alnst-ivan.PNG"
        },
        {
            id: "alnst_luka",
            name: "Luka",
            series: "Alien Stage",
            rarity: "SR",
            title: "The Golden Performer",
            image: "../assets/characters/alnst-luka.PNG"
        },
        {
            id: "alnst_hyuna",
            name: "Hyuna",
            series: "Alien Stage",
            rarity: "SR",
            title: "The Runaway Star",
            image: "../assets/characters/alnst-hyuna.PNG"
        },

        // THE APOTHECARY DIARIES
        {
            id: "ap_maomao",
            name: "Maomao",
            series: "The Apothecary Diaries",
            rarity: "SSR",
            title: "The Curious Apothecary",
            image: "../assets/characters/ap-maomao.PNG"
        },
        {
            id: "ap_jinshi",
            name: "Jinshi",
            series: "The Apothecary Diaries",
            rarity: "SSR",
            title: "The Moon Prince",
            image: "../assets/characters/ap-jinshi.PNG"
        },

        // ADD MORE SERIES BELOW
        // Copy a character entry and change its details.

    ],

    // ======================================
    // GACHA SETTINGS
    // ======================================

    rates: {
        SSR: 0.006,
        SR: 0.051,
        R: 0.943
    },

    pityLimit: 90,
    srPityLimit: 10,

    // ======================================
    // INITIALIZE SAVED DATA
    // ======================================

    init() {
        const data = StudyArchive.data;

        if (!data.gacha) {
            data.gacha = {
                pity: 0,
                srPity: 0,
                totalPulls: 0,
                history: []
            };
        }

        const gacha = data.gacha;

        if (!Array.isArray(gacha.history)) {
            gacha.history = [];
        }

        if (typeof gacha.pity !== "number") {
            gacha.pity = 0;
        }

        if (typeof gacha.srPity !== "number") {
            gacha.srPity = 0;
        }

        if (typeof gacha.totalPulls !== "number") {
            gacha.totalPulls = 0;
        }

        StudyArchive.save();
    },

    // ======================================
    // SELECT CHARACTER
    // ======================================

    getRandomCharacter(rarity) {
        const pool = this.characters.filter(character =>
            character.rarity === rarity
        );

        if (pool.length === 0) {
            console.error("No characters available for rarity:", rarity);
            return null;
        }

        return pool[Math.floor(Math.random() * pool.length)];
    },

    // ======================================
    // SINGLE WISH
    // ======================================

    pull(banner = "featured") {
        this.init();

        const data = StudyArchive.data.gacha;

        data.pity++;
        data.srPity++;
        data.totalPulls++;

        let rarity;
        const roll = Math.random();

        if (data.pity >= this.pityLimit) {
            rarity = "SSR";
        } else if (data.srPity >= this.srPityLimit) {
            rarity = roll < 0.12 ? "SSR" : "SR";
        } else if (roll < this.rates.SSR) {
            rarity = "SSR";
        } else if (roll < this.rates.SSR + this.rates.SR) {
            rarity = "SR";
        } else {
            rarity = "R";
        }

        const character = this.getRandomCharacter(rarity);

        if (!character) {
            return null;
        }

        if (rarity === "SSR") {
            data.pity = 0;
            data.srPity = 0;
        } else if (rarity === "SR") {
            data.srPity = 0;
        }

        const result = {
            ...character,
            banner,
            obtainedAt: new Date().toISOString(),
            pullNumber: data.totalPulls
        };

        data.history.unshift(result);

        StudyArchive.save();

        return result;
    },

    // ======================================
    // MULTIPLE WISHES
    // ======================================

    pullTen(banner = "featured") {
        const results = [];

        for (let i = 0; i < 10; i++) {
            const result = this.pull(banner);

            if (result) {
                results.push(result);
            }
        }

        return results;
    },

    // ======================================
    // GET SAVED INFORMATION
    // ======================================

    getPity() {
        this.init();
        return StudyArchive.data.gacha.pity;
    },

    getSRPity() {
        this.init();
        return StudyArchive.data.gacha.srPity;
    },

    getHistory() {
        this.init();
        return StudyArchive.data.gacha.history;
    },

    getTotalPulls() {
        this.init();
        return StudyArchive.data.gacha.totalPulls;
    },

    getCollection() {
        this.init();

        const history = this.getHistory();
        const owned = new Map();

        history.forEach(character => {
            if (!owned.has(character.id)) {
                owned.set(character.id, {
                    ...character,
                    copies: 1
                });
            } else {
                owned.get(character.id).copies++;
            }
        });

        return Array.from(owned.values());
    },

    // ======================================
    // IMAGE FALLBACK
    // ======================================

    getImage(character) {
        return character.image ||
            "../assets/characters/default-character.png";
    },

    // ======================================
    // ADD YOUR OWN CHARACTER
    // ======================================

    addCharacter(character) {
        const required = ["id", "name", "series", "rarity"];

        if (!required.every(key => character[key])) {
            console.error("Character is missing required information.");
            return false;
        }

        if (!["SSR", "SR", "R"].includes(character.rarity)) {
            console.error("Rarity must be SSR, SR, or R.");
            return false;
        }

        if (this.characters.some(item => item.id === character.id)) {
            console.error("That character ID already exists.");
            return false;
        }

        this.characters.push({
            title: "New Character",
            image: "../assets/characters/default-character.png",
            ...character
        });

        return true;
    }
};

window.Gacha = Gacha;

document.addEventListener("DOMContentLoaded", () => {
    Gacha.init();
    console.log("Multi-series Gacha initialized!");
});
