/**
 * ASSET MAP & LOGIC
 * Central repository for all static asset paths and mapping logic.
 */

// Global Asset Map
const ASSET_MAP = {
    // Memories - Populated dynamically from MEMORY_NAMES

    // Classes (English)
    "attacker": "images/classes/attacker.webp",
    "tank": "images/classes/tank.webp",
    "support": "images/classes/support.webp",
    "vanguard": "images/classes/vanguard.webp",
    "amplifier": "images/classes/amplifier.webp",

    // Classes (Russian Mapping)
    "атакующий": "images/classes/attacker.webp",
    "танк": "images/classes/tank.webp",
    "поддержка": "images/classes/support.webp",
    "авангард": "images/classes/vanguard.webp",
    "амплифаер": "images/classes/amplifier.webp",

    // Elements (English)
    "physical": "images/elements/physical.webp",
    "fire": "images/elements/fire.webp",
    "ice": "images/elements/ice.webp",
    "lightning": "images/elements/lightning.webp",
    "dark": "images/elements/dark.webp",

    // Elements (Russian Mapping)
    "физический": "images/elements/physical.webp",
    "огонь": "images/elements/fire.webp",
    "лед": "images/elements/ice.webp",
    "лёд": "images/elements/ice.webp",
    "молния": "images/elements/lightning.webp",
    "тьма": "images/elements/dark.webp",
    "нихил": "images/elements/dark.webp",

    // CUBs (Pets)
    "toniris": "Image/CUB/Toniris.webp",
    "frost oath": "Image/CUB/Frost Oath.webp",
    "nitor": "Image/CUB/Nitor.webp",
    "boreas": "Image/CUB/Boreas.webp",
    "jet jaeger": "Image/CUB/Jet Jaeger.webp",
    // "moonhopper": "Image/CUB/Moonhopper.webp", 
    // "shimmer": "Image/CUB/Shimmer.webp", 
    "punchy": "Image/CUB/Punchy.webp",
    "rainbow": "Image/CUB/Rainbow.webp",
    "motorbolt": "Image/CUB/Motorbolt.webp",
    "hades fangs": "Image/CUB/Hades Fangs.webp",
    "dawn chorus": "Image/CUB/Dawn Chorus.webp",
    "cetus": "Image/CUB/Cetus.webp",
    "shadow wing": "Image/CUB/Shadow Wing.webp",
    "huiyu": "Image/CUB/Huiyu.webp",
    "guardrake": "Image/CUB/Guardrake.webp",
    "dreamwing": "Image/CUB/Dreamwing.webp",
    "snowveil": "Image/CUB/Snowveil.webp",
    "corvus": "Image/CUB/Corvus.webp",
    "bramble angler": "Image/CUB/Bramble Angler.webp",
    "diamaton": "Image/CUB/Diamaton.webp",
    "billie": "Image/CUB/Billie.webp",
    "snow waltz": "Image/CUB/Snow Waltz.webp",
    "wrathfang": "Image/CUB/Wrathfang.webp",
    "cavaliere": "Image/CUB/Cavaliere.webp",
    "mirage blades": "Image/CUB/MirageBlades.webp",
    "noctiluca": "Image/CUB/Noctiluca.webp",
    "scaled rampart": "Image/CUB/Scaled Rampart.webp",
    "levvi": "Image/CUB/Levvi.webp",
    "beep-boop": "Image/CUB/Beep-Boop.webp",

    // Weapons (Auto-mapped to Image/Weapons/...)
    "lotus berserker": "Image/Weapons/Lotus Berserker.webp",
    "type zero": "Image/Weapons/TypeZero.webp",
    "inverse - chimera": "Image/Weapons/Inverse Chimera.webp",
    "inverse - shadow": "Image/Weapons/Inverse Shadow.webp",
    "benediction": "Image/Weapons/Benediction.webp",
    "wolf fang": "Image/Weapons/WolfFang.webp",
    "soul ripper": "Image/Weapons/Soul Ripper.webp",
    "ramiel": "Image/Weapons/Ramiel.webp",
    "berserk fusion": "Image/Weapons/Berserk Fusion.webp",
    "dragon wind": "Image/Weapons/Dragon Wind.webp",
    "zero scale": "Image/Weapons/ZeroScale.webp",
    "fusion dragon": "Image/Weapons/Fusion Dragon.webp",
    "hydro heat": "Image/Weapons/Hydro Heat.webp",
    "darkness": "Image/Weapons/Darkness.webp",
    "sakura": "Image/Weapons/Sakura.webp",
    "big kamui": "Image/Weapons/Big Kamui.webp",
    "peacemaker": "Image/Weapons/Peacemaker.webp",
    "purple peony": "Image/Weapons/Purple Peony.webp",
    "tonitrus": "Image/Weapons/Tonitrus.webp",
    "scion": "Image/Weapons/Scion.webp",
    "st. elmo": "Image/Weapons/StElmo.webp",
    "crimson birch": "Image/Weapons/Crimson Birch.webp",
    "sariel": "Image/Weapons/Sariel.webp",
    "thanatos": "Image/Weapons/Thanatos.webp",
    "gungnir": "Image/Weapons/Gungnir.webp",
    "baji": "Image/Weapons/Baji.webp",
    "qinghe": "Image/Weapons/Qinghe.webp",
    "ozma": "Image/Weapons/Ozma.webp",
    "virtuous contract - mod": "Image/Weapons/Virtuous Contract.webp",
    "cruel oath - mod": "Image/Weapons/Cruel Oath Mod.webp",
    "type-4o lance - mod": "Image/Weapons/Type-4O Lance.webp",
    "scale": "Image/Weapons/Scale.webp",
    "waldmeister": "Image/Weapons/Waldmeister.webp",
    "apollo": "Image/Weapons/Apollo.webp",
    "snore": "Image/Weapons/Snore.webp",
    "phoenix": "Image/Weapons/Phoenix.webp",
    "durendal": "Image/Weapons/Durendal.webp",
    "hestia": "Image/Weapons/Hestia.webp",
    "sarastro": "Image/Weapons/Sarastro.webp",
    "infinity": "Image/Weapons/Infinity.webp",
    "implosion": "Image/Weapons/Implosion.webp",
    "galatea": "Image/Weapons/Galatea.webp",
    "illuminare": "Image/Weapons/Illuminare.webp",
    "prometheus": "Image/Weapons/Prometheus.webp",
    "hecate": "Image/Weapons/Hecate.webp",
    "tranquil doll’s voice": "Image/Weapons/TranquilDollsVoice.webp",
    "key of tempus gate - stokes": "Image/Weapons/Key of Tempus Gate Stokes.webp",
    "the starry voyager": "Image/Weapons/StarVoyager.webp",
    "nightblaze": "Image/Weapons/Nightblaze.webp",
    "perpetuity": "Image/Weapons/Perpetuity.webp",
    "managarm": "Image/Weapons/Managarm.webp",
    "crimson howl": "Image/Weapons/Crimson Howl.webp",
    "astraea": "Image/Weapons/Astraea.webp",
    "metis": "Image/Weapons/Metis.webp",
    "★rock cannon": "Image/Weapons/★Rock Cannon.webp",
    "rock cannon": "Image/Weapons/★Rock Cannon.webp",
    "dark falcon": "Image/Weapons/Dark Falcon.webp",
    "akasha keyblade": "Image/Weapons/Akasha Keyblade.webp",
    "hacker's tune": "Image/Weapons/HackersTune.webp",
    "reconstruction of law": "Image/Weapons/Reconstruction of Law.webp",
    "cestus": "Image/Weapons/Cestus.webp",
    "dream roamer": "Image/Weapons/Dream Roamer.webp",
    "renewed dawn": "Image/Weapons/Renewed Dawn.webp",
    "flamewing of dawn": "Image/Weapons/Flamewing of Dawn.webp",
    "fudo myo-o": "Image/Weapons/Fudo Myoo.webp",
    "starlight glare": "Image/Weapons/StarlightGlare.webp",
    "alpha-omega": "Image/Weapons/Alpha Omega.webp",
    "sorrow of fata morgana": "Image/Weapons/Sorrow of Fata Morgana.webp",
    "orpheus' lullaby": "Image/Weapons/Orpheus Lullaby.webp",
    "final arbiter": "Image/Weapons/Final Arbiter.webp",
    "deathless flame": "Image/Weapons/Deathless Flame.webp",
    "devil sword dante": "Image/Weapons/Devil Sword Dante.webp",
    "yamato": "Image/Weapons/Yamato.webp",
    "aurora": "Image/Weapons/Aurora.webp",
    "osseous guillotine": "Image/Weapons/Osseous Guillotine.webp",
    "empyrean wrath": "Image/Weapons/Empyrean Wrath.webp",
    "ripples of the aloft sea": "Image/Weapons/Ripplesofthe Aloft Sea.webp",
    "neon wayfarer": "Image/Weapons/Neon Wayfarer.webp",
};

/**
 * Merge scanned images (Elements, Classes, Weapons, CUBs) into the global map.
 * Also handles localization mapping.
 */
function initializeAssets() {
    // 1. Dynamic Extension from CHAR_DATABASE (Weapons)
    if (typeof CHAR_DATABASE !== 'undefined') {
        CHAR_DATABASE.forEach(char => {
            if (char.weapon) {
                const key = char.weapon.toLowerCase();
                if (!ASSET_MAP[key]) {
                    const filename = key.replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') + ".webp";
                    ASSET_MAP[key] = `images/weapons/${filename}`;
                }
            }
        });
    }

    // 2. Dynamic Extension for MEMORIES
    if (typeof MEMORY_NAMES !== 'undefined') {
        MEMORY_NAMES.forEach(mem => {
            const key = mem.toLowerCase();
            // Default to Icon-1
            ASSET_MAP[key] = `Image/Memories/Memory-${mem}-Icon-1.webp`;
        });
    }

    // 3. Merge Externally Loaded Images
    if (typeof ELEMENT_IMAGES !== 'undefined') Object.assign(ASSET_MAP, ELEMENT_IMAGES);
    if (typeof CLASS_IMAGES !== 'undefined') {
        Object.assign(ASSET_MAP, CLASS_IMAGES);

        // Map Russian Keys to Scanned Keys
        if (ASSET_MAP['amplifier']) {
            ASSET_MAP['усилитель'] = ASSET_MAP['amplifier'];
            ASSET_MAP['амплифаер'] = ASSET_MAP['amplifier'];
        }
        if (ASSET_MAP['annihilator']) ASSET_MAP['аннигилятор'] = ASSET_MAP['annihilator'];
        if (ASSET_MAP['attacker']) ASSET_MAP['атакующий'] = ASSET_MAP['attacker'];
        if (ASSET_MAP['observer']) ASSET_MAP['наблюдатель'] = ASSET_MAP['observer'];
        if (ASSET_MAP['support']) ASSET_MAP['поддержка'] = ASSET_MAP['support'];
        if (ASSET_MAP['tank']) ASSET_MAP['танк'] = ASSET_MAP['tank'];
        if (ASSET_MAP['vanguard']) ASSET_MAP['авангард'] = ASSET_MAP['vanguard'];
    }
    if (typeof WEAPON_IMAGES !== 'undefined') Object.assign(ASSET_MAP, WEAPON_IMAGES);
    if (typeof CUB_IMAGES !== 'undefined') Object.assign(ASSET_MAP, CUB_IMAGES);

    // 4. Update Extra Russian Aliases
    if (ASSET_MAP['phys']) ASSET_MAP['physical'] = ASSET_MAP['phys'];
    if (ASSET_MAP['physical']) ASSET_MAP['физический'] = ASSET_MAP['physical'];

    if (ASSET_MAP['fire']) ASSET_MAP['огонь'] = ASSET_MAP['fire'];

    if (ASSET_MAP['ice']) {
        ASSET_MAP['лед'] = ASSET_MAP['ice'];
        ASSET_MAP['лёд'] = ASSET_MAP['ice'];
    }

    if (ASSET_MAP['thunder']) ASSET_MAP['lightning'] = ASSET_MAP['thunder'];
    if (ASSET_MAP['lightning']) ASSET_MAP['молния'] = ASSET_MAP['lightning'];

    if (ASSET_MAP['nihl']) ASSET_MAP['nihil'] = ASSET_MAP['nihl'];
    if (ASSET_MAP['dark']) {
        ASSET_MAP['тьма'] = ASSET_MAP['dark'];
        ASSET_MAP['nihil'] = ASSET_MAP['dark'];
    }

    // Safety check just in case 'nihl' exists but not 'nihil' text
    if (ASSET_MAP['nihl']) ASSET_MAP['нихил'] = ASSET_MAP['nihl'];

    // 5. Generate Sorted Lists for Indexing (URL Optimization)
    // We use window.VAR to export them globally
    window.WEAPON_NAMES = (typeof WEAPON_IMAGES !== 'undefined') ? Object.keys(WEAPON_IMAGES).sort() : [];
    window.CUB_NAMES = (typeof CUB_IMAGES !== 'undefined') ? Object.keys(CUB_IMAGES).sort() : [];
}

// Auto-run initialization if data is ready, or export function to be called from app.js
// Since this is a simple script text, it runs immediately.
// We should rely on app.js calling this OR call it here if we assume data scripts are loaded before this.
// In index.html, we will load data scripts first.
// So calling it here is safe.
// However, we need to make sure WEAPON_IMAGES etc are loaded.
// If we load this script after them, we are good.

// We will export it as a global function to be called in DOMContentLoaded in app.js?
// Or just run it? The original code ran it in script tags at different points.
// Better to run it once all scripts are loaded.

// Solution: We'll attach it to window and let app.js call it, or call it here but wrap in a checks?
// The original code had `mergeImages()` called explicitly.
// Let's run it here assuming the scripts are ordered correctly in HTML.
// But wait, `CHAR_DATABASE` etc might be loaded, but `WEAPON_IMAGES` are in separate files.
// If we place attributes.js AFTER all those data files in HTML, we can run it here.
