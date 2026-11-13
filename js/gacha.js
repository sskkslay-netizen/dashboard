
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
            description: "A quick-witted former Port Mafia executive who now works with the Armed Detective Agency. His ability, No Longer Human, nullifies other abilities through touch.",
            image: "../assets/characters/bsd_dazai.PNG"
        },
        {
            id: "bsd_chuuya",
            name: "Chuuya Nakahara",
            series: "Bungou Stray Dogs",
            rarity: "SSR",
            title: "Upon the Tainted Sorrow",
            description: "A bold, sharp-tempered executive of the Port Mafia. His ability, Upon the Tainted Sorrow, lets him manipulate gravity.",
            image: "../assets/characters/bsd_chuuya.PNG"
        },
        {
            id: "bsd_ranpo",
            name: "Ranpo Edogawa",
            series: "Bungou Stray Dogs",
            rarity: "SR",
            title: "Super Deduction",
            description: "A celebrated detective of the Armed Detective Agency, known for solving cases through keen observation and confidence in his reasoning.",
            image: "../assets/characters/bsd_ranpo.PNG"
        },
        {
            id: "bsd_atsushi",
            name: "Atsushi Nakajima",
            series: "Bungou Stray Dogs",
            rarity: "SR",
            title: "Beast Beneath the Moonlight",
            description: "A kind young detective learning to trust his own strength. His ability lets him transform into a powerful white tiger.",
            image: "../assets/characters/bsd_atsushi.PNG"
        },
        {
            id: "bsd_akutagawa",
            name: "Ryunosuke Akutagawa",
            series: "Bungou Stray Dogs",
            rarity: "SSR",
            title: "Rashomon",
            description: "A formidable Port Mafia member whose ability turns his coat into a weapon called Rashomon. His stern resolve hides a difficult past.",
            image: "../assets/characters/bsd_akutagawa.PNG"
        },
        {
            id: "bsd_kunikida",
            name: "Doppo Kunikida",
            series: "Bungou Stray Dogs",
            rarity: "SR",
            title: "Ideal",
            description: "A methodical detective who records his goals in a notebook. His ability, The Matchless Poet, can bring written plans to life.",
            image: "../assets/characters/bsd_kunikida.PNG"
        },
        {
            id: "bsd_yosano",
            name: "Akiko Yosano",
            series: "Bungou Stray Dogs",
            rarity: "SR",
            title: "Thou Shalt Not Die",
            description: "A brilliant doctor of the Armed Detective Agency with a fearless bedside manner. Her ability can heal severe injuries under specific conditions.",
            image: "../assets/characters/bsd_yosano.PNG"
        },
        {
            id: "bsd_fyodor",
            name: "Fyodor Dostoevsky",
            series: "Bungou Stray Dogs",
            rarity: "SSR",
            title: "Crime and Punishment",
            description: "A calculating leader of the mysterious Rats in the House of the Dead. He prefers careful plans and psychological games to direct confrontation.",
            image: "../assets/characters/bsd_fyodor.PNG"
        },
        {
            id: "bsd_kenji",
            name: "Kenji Miyazaki",
            series: "Bungou Stray Dogs",
            rarity: "SSR",
            title: "The Undefeated by the Rain",
            description: "A cheerful country-raised detective whose strength grows when he is hungry. His direct kindness makes him a steady friend to the Agency.",
            image: "../assets/characters/bsd_kenji.PNG"
        },

        // DEMON SLAYER
        {
            id: "kny_tanjiro",
            name: "Tanjiro Kamado",
            series: "Demon Slayer",
            rarity: "SSR",
            title: "Hinokami Kagura",
            description: "A compassionate Demon Slayer who keeps moving forward to protect others and find a way to help his sister. He fights with keen senses and determined resolve.",
            image: "../assets/characters/kny-tanjiro.PNG"
        },
        {
            id: "kny_nezuko",
            name: "Nezuko Kamado",
            series: "Demon Slayer",
            rarity: "SSR",
            title: "Demon Form",
            description: "Tanjiro's younger sister, who retains a strong bond with her family despite becoming a demon. She protects people and can fight with remarkable strength.",
            image: "../assets/characters/kny-nezuko.PNG"
        },
        {
            id: "kny_zenitsu",
            name: "Zenitsu Agatsuma",
            series: "Demon Slayer",
            rarity: "SR",
            title: "Thunder Breathing",
            description: "A nervous but devoted Demon Slayer whose Thunder Breathing technique becomes exceptionally fast and powerful when he focuses.",
            image: "../assets/characters/kny-zenitsu.PNG"
        },
        {
            id: "kny_inosuke",
            name: "Inosuke Hashibira",
            series: "Demon Slayer",
            rarity: "SR",
            title: "Beast Breathing",
            description: "A boisterous fighter raised in the mountains. Inosuke relies on instinct, unusual flexibility, and his self-created Beast Breathing style.",
            image: "../assets/characters/kny-inosuke.PNG"
        },
        {
            id: "kny_giyu",
            name: "Giyu Tomioka",
            series: "Demon Slayer",
            rarity: "SSR",
            title: "Water Hashira",
            description: "The reserved Water Hashira, a highly skilled swordsman who often keeps his thoughts to himself while quietly looking out for others.",
            image: "../assets/characters/kny-giyu.PNG"
        },
        {
            id: "kny_shinobu",
            name: "Shinobu Kocho",
            series: "Demon Slayer",
            rarity: "SSR",
            title: "Insect Hashira",
            description: "The Insect Hashira, a poised and observant swordswoman who uses wisteria-based techniques and exceptional knowledge of medicine.",
            image: "../assets/characters/kny-shinobu.PNG"
        },
        {
            id: "kny_rengoku",
            name: "Kyojuro Rengoku",
            series: "Demon Slayer",
            rarity: "SSR",
            title: "Flame Hashira",
            description: "The Flame Hashira, known for his energetic confidence and unwavering sense of duty. He inspires others to meet hardship with courage.",
            image: "../assets/characters/kny-rengoku.PNG"
        },
        {
            id: "kny_mitsuri",
            name: "Mitsuri Kanroji",
            series: "Demon Slayer",
            rarity: "SR",
            title: "Love Hashira",
            description: "The Love Hashira, an affectionate and optimistic swordswoman whose unusual flexibility supports her distinctive combat style.",
            image: "../assets/characters/kny-mitsuri.PNG"
        },

        // MY HERO ACADEMIA
        {
            id: "mha_deku",
            name: "Izuku Midoriya",
            series: "My Hero Academia",
            rarity: "SSR",
            title: "One For All",
            description: "A thoughtful student who studies heroes closely and acts decisively to help people. He inherits the power One For All and works to master it responsibly.",
            image: "../assets/characters/mha-deku.PNG"
        },
        {
            id: "mha_bakugo",
            name: "Katsuki Bakugo",
            series: "My Hero Academia",
            rarity: "SSR",
            title: "Explosion",
            description: "A fiercely competitive student with a powerful Explosion Quirk. Beneath his blunt confidence is a relentless drive to improve and become a top hero.",
            image: "../assets/characters/mha-bakugo.PNG"
        },
        {
            id: "mha_todoroki",
            name: "Shoto Todoroki",
            series: "My Hero Academia",
            rarity: "SSR",
            title: "Half-Cold Half-Hot",
            description: "A composed student whose Half-Cold Half-Hot Quirk lets him control ice and fire from opposite sides of his body.",
            image: "../assets/characters/mha-todoroki.PNG"
        },
        {
            id: "mha_uraraka",
            name: "Ochaco Uraraka",
            series: "My Hero Academia",
            rarity: "SR",
            title: "Zero Gravity",
            description: "An upbeat student whose Zero Gravity Quirk makes objects she touches weightless. She is motivated by caring for her family and helping others.",
            image: "../assets/characters/mha-uraraka.PNG"
        },
        {
            id: "mha_aizawa",
            name: "Shota Aizawa",
            series: "My Hero Academia",
            rarity: "SR",
            title: "Erasure",
            description: "A practical, sleep-deprived teacher and professional hero. His Erasure Quirk can temporarily disable another person's Quirk while he keeps them in sight.",
            image: "../assets/characters/mha-aizawa.PNG"
        },
        {
            id: "mha_dabi",
            name: "Dabi",
            series: "My Hero Academia",
            rarity: "SSR",
            title: "Blueflame",
            description: "A guarded villain who wields intense blue flames. His history and motives connect him to the Todoroki family.",
            image: "../assets/characters/mha-dabi.PNG"
        },
        {
            id: "mha_hawks",
            name: "Hawks",
            series: "My Hero Academia",
            rarity: "SR",
            title: "Fierce Wings",
            description: "A relaxed, observant pro hero who moves quickly with his Fierce Wings Quirk. He often gathers information while helping people behind the scenes.",
            image: "../assets/characters/mha-hawks.PNG"
        },

        // ALIEN STAGE
        {
            id: "alnst_mizi",
            name: "Mizi",
            series: "Alien Stage",
            rarity: "SSR",
            title: "The Brightest Star",
            description: "An expressive performer whose bright stage presence and strong emotions make her difficult to overlook in Alien Stage's high-stakes musical competition.",
            image: "../assets/characters/alnst-mizi.PNG"
        },
        {
            id: "alnst_sua",
            name: "Sua",
            series: "Alien Stage",
            rarity: "SSR",
            title: "A Quiet Melody",
            description: "A gentle, reserved singer whose deep affection for Mizi shapes many of her choices and performances.",
            image: "../assets/characters/alnst-sua.PNG"
        },
        {
            id: "alnst_till",
            name: "Till",
            series: "Alien Stage",
            rarity: "SSR",
            title: "The Rebel Musician",
            description: "A rebellious musician who channels frustration and longing into intense performances. Music is one of the ways he expresses himself most clearly.",
            image: "../assets/characters/alnst-till.PNG"
        },
        {
            id: "alnst_ivan",
            name: "Ivan",
            series: "Alien Stage",
            rarity: "SSR",
            title: "The Silent Observer",
            description: "A quiet, perceptive performer who watches those around him closely. His restrained manner contrasts with the strong feelings he keeps private.",
            image: "../assets/characters/alnst-ivan.PNG"
        },
        {
            id: "alnst_luka",
            name: "Luka",
            series: "Alien Stage",
            rarity: "SR",
            title: "The Golden Performer",
            description: "A polished, charismatic singer with a controlled stage presence. Luka knows how to command attention in the competition.",
            image: "../assets/characters/alnst-luka.PNG"
        },
        {
            id: "alnst_hyuna",
            name: "Hyuna",
            series: "Alien Stage",
            rarity: "SR",
            title: "The Runaway Star",
            description: "A determined former performer who refuses to accept the system around her. Hyuna is resourceful, outspoken, and fiercely protective of her companions.",
            image: "../assets/characters/alnst-hyuna.PNG"
        },

        // THE APOTHECARY DIARIES
        {
            id: "ap_maomao",
            name: "Maomao",
            series: "The Apothecary Diaries",
            rarity: "SSR",
            title: "The Curious Apothecary",
            description: "A sharp-eyed palace apothecary fascinated by medicine and poisons. Maomao uses practical knowledge and careful observation to solve mysteries.",
            image: "../assets/characters/ap-maomao.PNG"
        },
        {
            id: "ap_jinshi",
            name: "Jinshi",
            series: "The Apothecary Diaries",
            rarity: "SSR",
            title: "The Moon Prince",
            description: "A graceful palace official whose charm and intelligence help him navigate court life. He often turns to Maomao when a mystery needs a discerning eye.",
            image: "../assets/characters/ap-jinshi.PNG"
        },

        // ADD MORE SERIES BELOW
        // Copy a character entry and change its details.

    ],

    maxCardLevel: 5,

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

        if (
            !data.characterCardLevels ||
            typeof data.characterCardLevels !== "object" ||
            Array.isArray(data.characterCardLevels)
        ) {
            data.characterCardLevels = {};
        }

        StudyArchive.save();
    },

    // ======================================
    // SELECT CHARACTER
    // ======================================

    getRandomCharacter(rarity) {
        const fallbackRarities = {
            SSR: ["SR", "R"],
            SR: ["R", "SSR"],
            R: ["SR", "SSR"]
        };
        const availableRarity = [rarity, ...(fallbackRarities[rarity] || [])]
            .find(candidate => this.characters.some(character =>
                character.rarity === candidate
            ));

        if (!availableRarity) {
            console.error("No characters available for rarity:", rarity);
            return null;
        }

        const pool = this.characters.filter(character =>
            character.rarity === availableRarity
        );

        return pool[Math.floor(Math.random() * pool.length)];
    },

    // ======================================
    // SINGLE WISH
    // ======================================

    pull(banner = "featured") {
        this.init();

        const data = StudyArchive.data.gacha;

        let rarity;
        const roll = Math.random();

        if (data.pity + 1 >= this.pityLimit) {
            rarity = "SSR";
        } else if (data.srPity + 1 >= this.srPityLimit) {
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

        data.pity++;
        data.srPity++;
        data.totalPulls++;

        if (character.rarity === "SSR") {
            data.pity = 0;
            data.srPity = 0;
        } else if (character.rarity === "SR") {
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

        return Array.from(owned.values()).map(character => ({
            ...character,
            level: this.getCardLevel(character.id)
        }));
    },

    getCardLevel(characterId) {
        const savedLevel = Number(
            StudyArchive.data.characterCardLevels?.[characterId]
        );
        return Number.isInteger(savedLevel) &&
            savedLevel >= 1 &&
            savedLevel <= this.maxCardLevel
            ? savedLevel
            : 1;
    },

    levelUpCard(characterId) {
        this.init();
        if (typeof characterId !== "string" || !characterId) {
            throw new Error("Choose a character card to level up.");
        }

        const history = StudyArchive.data.gacha.history;
        const copies = history.reduce((total, entry) => {
            const character = entry.character || entry;
            return total + (character.id === characterId ? 1 : 0);
        }, 0);
        if (!copies) throw new Error("You do not own this character card.");

        const currentLevel = this.getCardLevel(characterId);
        if (currentLevel >= this.maxCardLevel) {
            throw new Error("This character card is already at max level.");
        }
        if (copies <= currentLevel) {
            throw new Error("You need one unspent duplicate to level up this card.");
        }

        const data = StudyArchive.data;
        const previousLevel = data.characterCardLevels[characterId];
        const level = currentLevel + 1;
        data.characterCardLevels[characterId] = level;
        try {
            StudyArchive.save();
        } catch (error) {
            if (previousLevel === undefined) {
                delete data.characterCardLevels[characterId];
            } else {
                data.characterCardLevels[characterId] = previousLevel;
            }
            throw new Error("The card level could not be saved.", { cause: error });
        }

        return {
            level,
            duplicatesRemaining: copies - level
        };
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
