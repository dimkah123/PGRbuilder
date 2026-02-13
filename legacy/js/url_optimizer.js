/**
 * URL OPTIMIZER
 * Logic to compress/decompress state for sharing via URL.
 * Uses lz-string for compression and dictionary mapping for size reduction.
 */

const UrlOptimizer = {
    // Dictionary Helpers
    getMemories() {
        if (typeof MEMORY_NAMES !== 'undefined') {
            return [...MEMORY_NAMES].sort();
        }
        return [];
    },

    getChars() {
        if (typeof CHAR_DATABASE !== 'undefined') {
            return CHAR_DATABASE;
        }
        return [];
    },

    // ------------------------------------------------
    // OPTIMIZE (State -> Minified Object)
    // ------------------------------------------------
    optimize(state) {
        const min = {};
        const mems = this.getMemories();
        const chars = this.getChars();

        // 1. Character & Frame
        // Try to find exact match in DB to send ID instead of strings
        const charIdx = chars.findIndex(c =>
            (c.enFrame && c.enFrame === state.enFrame) ||
            (c.frame === state.frame)
        );

        if (charIdx !== -1) {
            min.cI = charIdx; // Character Index (covers name, frame, enFrame, default class/element)

            // Check if overrides exist
            const dbChar = chars[charIdx];
            if (state.rank !== dbChar.rank) min.r = state.rank;
            if (state.element !== dbChar.element) min.el = state.element;
            if (state.class !== dbChar.class) min.cl = state.class;

            // Weapon/CUB/Affix are often custom
        } else {
            // Fallback to storing raw strings if custom character
            if (state.char) min.c = state.char;
            if (state.frame) min.f = state.frame;
            if (state.enFrame) min.ef = state.enFrame;
            if (state.rank) min.r = state.rank;
            if (state.element) min.el = state.element;
            if (state.class) min.cl = state.class;
        }

        // 2. Equipment
        // Weapon -> Index
        if (state.weapon) {
            const wName = state.weapon.toLowerCase().trim();
            if (typeof WEAPON_NAMES !== 'undefined') {
                const wIdx = WEAPON_NAMES.indexOf(wName);
                min.w = (wIdx !== -1) ? wIdx : state.weapon;
            } else {
                min.w = state.weapon;
            }
        }

        // Affix
        if (state.affix) min.a = state.affix;

        // CUB -> Index
        if (state.cub) {
            const cName = state.cub.toLowerCase().trim();
            if (typeof CUB_NAMES !== 'undefined') {
                const cIdx = CUB_NAMES.indexOf(cName);
                min.cub = (cIdx !== -1) ? cIdx : state.cub;
            } else {
                min.cub = state.cub;
            }
        }

        if (state.posCode) min.p = state.posCode;

        // 3. Builds
        if (state.builds && state.builds.length > 0) {
            min.b = state.builds.map(build => {
                const bMin = {};
                if (build.title) bMin.t = build.title;

                // Memories -> Indices
                if (build.mems && build.mems.some(m => m)) {
                    bMin.m = build.mems.map(mName => {
                        if (!mName) return "";
                        const mIdx = mems.indexOf(mName);
                        return mIdx !== -1 ? mIdx : mName; // Return Index if found, else Name
                    });
                    // Trim trailing empty strings
                    while (bMin.m.length > 0 && bMin.m[bMin.m.length - 1] === "") {
                        bMin.m.pop();
                    }
                }

                // Harmony
                if (build.harm) {
                    const hIdx = mems.indexOf(build.harm);
                    bMin.h = hIdx !== -1 ? hIdx : build.harm;
                }

                // Resonance
                if (build.resTopSlot) bMin.rtS = build.resTopSlot;
                if (build.resTopSkill) bMin.rtK = build.resTopSkill;
                if (build.resBotSlot) bMin.rbS = build.resBotSlot;
                if (build.resBotSkill) bMin.rbK = build.resBotSkill;

                // Description (Strip HTML)
                if (build.desc) {
                    // Simple HTML strip but preserve newlines
                    let clean = build.desc.replace(/<br\s*\/?>/gi, '\n');
                    clean = clean.replace(/<div>/gi, '\n');
                    clean = clean.replace(/<\/div>/gi, '');
                    clean = clean.replace(/<[^>]+>/g, ''); // Strip remaining tags
                    clean = clean.trim();
                    if (clean) bMin.d = clean;
                }

                return bMin;
            });
        }

        return min;
    },

    // ------------------------------------------------
    // RESTORE (Minified Object -> State)
    // ------------------------------------------------
    restore(min) {
        const state = {
            builds: []
        };
        const mems = this.getMemories();
        const chars = this.getChars();

        // 1. Character
        if (min.cI !== undefined && chars[min.cI]) {
            const dbChar = chars[min.cI];
            state.char = dbChar.name;
            state.frame = dbChar.frame;
            state.enFrame = dbChar.enFrame;
            // Defaults
            state.rank = min.r || dbChar.rank;
            state.element = min.el || dbChar.element;
            state.class = min.cl || dbChar.class;
        } else {
            state.char = min.c || "";
            state.frame = min.f || "";
            state.enFrame = min.ef || "";
            state.rank = min.r || "";
            state.element = min.el || "";
            state.class = min.cl || "";
        }

        // 2. Equipment
        if (min.w !== undefined) {
            if (typeof min.w === 'number' && typeof WEAPON_NAMES !== 'undefined') {
                state.weapon = WEAPON_NAMES[min.w] || "";
            } else {
                state.weapon = min.w || "";
            }
        } else {
            state.weapon = "";
        }

        state.affix = min.a || "";

        if (min.cub !== undefined) {
            if (typeof min.cub === 'number' && typeof CUB_NAMES !== 'undefined') {
                state.cub = CUB_NAMES[min.cub] || "";
            } else {
                state.cub = min.cub || "";
            }
        } else {
            state.cub = "";
        }

        state.posCode = min.p || "";

        // 3. Builds
        if (min.b && Array.isArray(min.b)) {
            state.builds = min.b.map(bMin => {
                const build = {
                    title: bMin.t || "",
                    mems: [],
                    harm: "",
                    resTopSlot: bMin.rtS || "",
                    resTopSkill: bMin.rtK || "",
                    resBotSlot: bMin.rbS || "",
                    resBotSkill: bMin.rbK || "",
                    desc: bMin.d || "" // Already plain text
                };

                // Memories
                if (bMin.m && Array.isArray(bMin.m)) {
                    build.mems = bMin.m.map(val => {
                        if (typeof val === 'number') {
                            return mems[val] || "";
                        }
                        return val || "";
                    });
                    // Pad back to 6
                    while (build.mems.length < 6) build.mems.push("");
                } else {
                    build.mems = ["", "", "", "", "", ""];
                }

                // Harmony
                if (bMin.h !== undefined) {
                    if (typeof bMin.h === 'number') {
                        build.harm = mems[bMin.h] || "";
                    } else {
                        build.harm = bMin.h;
                    }
                }

                return build;
            });
        }

        return state;
    },

    // ------------------------------------------------
    // PUBLIC API
    // ------------------------------------------------
    generateLink(state) {
        try {
            const minified = this.optimize(state);
            const json = JSON.stringify(minified);
            const compressed = LZString.compressToEncodedURIComponent(json);

            const url = new URL(window.location.href);
            // Clear old data param if exists
            url.searchParams.delete('data');
            url.searchParams.set('d', compressed);
            return url.toString();
        } catch (e) {
            console.error("Link Generation Error:", e);
            return null;
        }
    },

    parseLink() {
        const params = new URLSearchParams(window.location.search);

        // 1. Try New Format (?d=)
        const compressed = params.get('d');
        if (compressed) {
            try {
                const json = LZString.decompressFromEncodedURIComponent(compressed);
                if (json) {
                    const minified = JSON.parse(json);
                    return this.restore(minified);
                }
            } catch (e) {
                console.error("New Format Load Error:", e);
            }
        }

        // 2. Try Old Format (?data=)
        const oldData = params.get('data');
        if (oldData) {
            try {
                const json = decodeURIComponent(escape(atob(oldData)));
                return JSON.parse(json); // Old format matches internal state directly
            } catch (e) {
                console.error("Old Format Load Error:", e);
            }
        }

        return null;
    }
};

window.UrlOptimizer = UrlOptimizer;
