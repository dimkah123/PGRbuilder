import { ASSET_MAP, CHARACTER_IMAGES, CLASS_TO_PREFIX, CHAR_DATABASE, ELEMENT_NAMES, CLASS_NAMES, MEMORY_NAMES, WEAPON_RESONANCES, RANK_OPTIONS } from './data.js';

function createBuild() {
    return {
        title: '',
        mems: ['', '', '', '', '', ''],
        harm: '',
        resTopSlot: '',
        resTopSkill: '',
        resBotSlot: '',
        resBotSkill: '',
        desc: '',
        wRes: [null, null, null] // Initialize weapon resonances
    };
}

// Helper to find key in localized objects (exported for sharing with autocomplete.js)
export const findLocalizedKey = (obj, val) => {
    if (!val || val === '-') return null;
    for (let l in obj) {
        const k = Object.keys(obj[l]).find(key => obj[l][key].toLowerCase() === val.toLowerCase());
        if (k) return k;
    }
    return null;
};

class AppState {
    // Character Info
    isInitialLoad = $state(true);
    isLoading = $state(true);
    char = $state('');
    frame = $state('');
    enFrame = $state('');
    rank = $state('');

    // Auth
    userToken = $state(null);
    sessionToken = $state(null);
    userProfile = $state(null);

    // Stats
    element = $state('-');
    _class = $state('-');

    // Mobile Drag & Drop equivalent (Copy/Paste)
    draggedMemory = $state(null);
    _touchDragJustEnded = false; // Prevents ghost click after touch drag

    get class() { return this._class; }
    set class(v) {
        this._class = v;
        this.validateResonances();
    }

    validateResonances() {
        const newClass = this._class;
        const allowedPrefix = CLASS_TO_PREFIX[newClass];

        this.builds.forEach((build, bIdx) => {
            if (!build.wRes) return;

            // Filter valid resonances
            const validRes = build.wRes.filter(res => {
                if (!res) return false; // Already null

                // 1. UN (Universal) is always valid
                if (res.prefix === 'UN') return true;

                // 2. Vanguard (UNI) character can equip ANY resonance
                if (allowedPrefix === 'UNI') return true;

                // 3. Otherwise, prefix must match character's class prefix
                const isValid = res.prefix === allowedPrefix;

                return isValid;
            });

            // Shift left (compact array) and pad with nulls
            const newWRes = [...validRes, null, null, null].slice(0, 3);
            build.wRes = newWRes;
        });
    }

    weapon = $state('-');
    affix = $state('-');
    cub = $state('-');

    // Internal Real Names (for images)
    weaponReal = $state('');
    cubReal = $state('');

    // Positioning
    posCode = $state('');

    // Builds
    builds = $state([createBuild(), createBuild()]);
    loadedBuildOwner = $state(null); // ID of the owner of the currently loaded build

    // Computed Images
    get charImg() {
        // Find image based on EnFrame or Frame
        const search = (this.enFrame || this.frame || '').toLowerCase().trim();
        if (!search) return '';
        let img = CHARACTER_IMAGES.find(i => i.frame.toLowerCase() === search);
        if (!img) img = CHARACTER_IMAGES.find(i => i.frame.toLowerCase().includes(search));
        return img ? img.file : '';
    }

    get elementImg() { return ASSET_MAP[(this.element || '').toLowerCase()] || ''; }
    get classImg() { return ASSET_MAP[(this.class || '').toLowerCase()] || ''; }
    get weaponImg() { return ASSET_MAP[(this.weaponReal || this.weapon || '').toLowerCase()] || ''; }
    get affixImg() { return ASSET_MAP[(this.affix || '').toLowerCase()] || ''; }
    get cubImg() { return ASSET_MAP[(this.cubReal || this.cub || '').toLowerCase()] || ''; }

    lang = $state('ru');

    toggleLanguage() {
        const oldLang = this.lang;
        this.lang = this.lang === 'ru' ? 'en' : 'ru';
        localStorage.setItem('pgr_lang', this.lang);

        const isEn = this.lang === 'en';

        // Refresh current character name and frame if exists in DB
        const searchVal = (this.enFrame || this.frame || '').toLowerCase().trim();
        if (searchVal) {
            const dbEntry = CHAR_DATABASE.find(c =>
                (c.frame && c.frame.toLowerCase() === searchVal) ||
                (c.enFrame && c.enFrame.toLowerCase() === searchVal)
            );
            if (dbEntry) {
                this.char = isEn ? dbEntry.enName || dbEntry.name : dbEntry.name;
                this.frame = isEn ? dbEntry.enFrame || dbEntry.frame : dbEntry.frame;
            }
        }

        // Migrate Element
        const elementKey = findLocalizedKey(ELEMENT_NAMES, this.element);
        if (elementKey) this.element = ELEMENT_NAMES[this.lang][elementKey];

        // Migrate Class
        const classKey = findLocalizedKey(CLASS_NAMES, this._class);
        if (classKey) this._class = CLASS_NAMES[this.lang][classKey];

        // Migrate Affix
        const affixKey = findLocalizedKey(ELEMENT_NAMES, this.affix);
        if (affixKey) this.affix = ELEMENT_NAMES[this.lang][affixKey];

        // Localize "Signature" labels if active
        if (this.weapon === 'СИГНАТУРНОЕ' || this.weapon === 'SIGNATURE') {
            this.weapon = isEn ? 'SIGNATURE' : 'СИГНАТУРНОЕ';
        }
        if (this.cub === 'СИГНАТУРНЫЙ' || this.cub === 'SIGNATURE') {
            this.cub = isEn ? 'SIGNATURE' : 'СИГНАТУРНЫЙ';
        }
    }

    constructor() {
        if (typeof window !== 'undefined') {
            const savedLang = localStorage.getItem('pgr_lang');
            if (savedLang) this.lang = savedLang;

            const savedToken = localStorage.getItem('pgr_user_token');
            const savedSessionToken = localStorage.getItem('pgr_session_token');
            const savedProfile = localStorage.getItem('pgr_user_profile');

            if (savedSessionToken) {
                this.sessionToken = savedSessionToken;
                if (savedProfile) {
                    try {
                        this.userProfile = JSON.parse(savedProfile);
                    } catch (e) {
                        console.error('Failed to parse saved profile', e);
                    }
                }
            } else if (savedToken) {
                this.userToken = savedToken;
                let profile = null;

                // Try load profile
                if (savedProfile) {
                    try {
                        profile = JSON.parse(savedProfile);
                    } catch (e) {
                        console.error('Failed to parse saved profile', e);
                    }
                }

                // If profile missing or missing ID (stale data), re-decode
                if (!profile || !profile.id) {
                    try {
                        console.log('Repairing user profile from token...');
                        const payload = JSON.parse(atob(savedToken.split(".")[1]));

                        // Check expiration
                        const now = Math.floor(Date.now() / 1000);
                        if (payload.exp && payload.exp < now) {
                            console.warn('Saved token is expired.');
                            this.userToken = null;
                            localStorage.removeItem('pgr_user_token');
                            localStorage.removeItem('pgr_user_profile');
                            profile = null;
                        } else {
                            profile = {
                                name: payload.name,
                                email: payload.email,
                                picture: payload.picture,
                                id: payload.sub
                            };
                            // Update storage with fixed profile
                            localStorage.setItem('pgr_user_profile', JSON.stringify(profile));
                        }
                    } catch (e) {
                        console.error('Failed to decode token for repair', e);
                        this.userToken = null; // Invalid token
                        profile = null;
                    }
                } else {
                    // Start of else block for checking expiration even if profile exists
                    try {
                        const payload = JSON.parse(atob(savedToken.split(".")[1]));
                        const now = Math.floor(Date.now() / 1000);
                        if (payload.exp && payload.exp < now) {
                            console.warn('Saved token is expired.');
                            this.userToken = null;
                            localStorage.removeItem('pgr_user_token');
                            localStorage.removeItem('pgr_user_profile');
                            profile = null;
                        }
                    } catch (e) {
                        // ignore
                    }
                }

                this.userProfile = profile;
                if (this.sessionToken) {
                    this.refreshSession();
                }
            }
        }
    }

    async refreshSession() {
        if (!this.sessionToken) return;

        try {
            const res = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionToken: this.sessionToken })
            });

            if (res.ok) {
                const data = await res.json();
                this.userProfile = data.userProfile;
                localStorage.setItem("pgr_user_profile", JSON.stringify(this.userProfile));
            } else if (res.status === 401) {
                this.logout();
            }
        } catch (e) {
            console.error('Silent refresh failed', e);
        }
    }

    logout() {
        this.userToken = null;
        this.sessionToken = null;
        this.userProfile = null;
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('pgr_user_token');
            localStorage.removeItem('pgr_session_token');
            localStorage.removeItem('pgr_user_profile');
        }
    }

    addBuild() {
        this.builds.push(createBuild());
    }

    removeBuild(index) {
        this.builds.splice(index, 1);
    }

    // Global Title (for the entire configuration)
    title = $state('');

    serialize() {
        // Compact Format
        return {
            v: 2, // version
            l: this.lang === 'ru' ? 0 : 1,
            gt: this.title, // Global Title
            c: CHAR_DATABASE.findIndex(c => c.enFrame === this.enFrame || c.frame === this.frame),
            r: RANK_OPTIONS.indexOf(this.rank),
            w: this.weaponReal || this.weapon,
            a: findLocalizedKey(ELEMENT_NAMES, this.affix) || this.affix,
            cb: this.cubReal || this.cub,
            pc: this.posCode,
            b: this.builds.map(b => ({
                t: b.title,
                m: b.mems.map(m => MEMORY_NAMES.indexOf(m)),
                h: MEMORY_NAMES.indexOf(b.harm),
                rt: b.resTopSlot,
                rts: b.resTopSkill,
                rb: b.resBotSlot,
                rbs: b.resBotSkill,
                d: b.desc,
                wr: b.wRes.map(r => r ? WEAPON_RESONANCES.findIndex(wr => wr.name === r.name) : null)
            }))
        };
    }

    hydrate(data) {
        if (!data) return;

        // Detect Version/Format
        if (data.v === 2) {
            this.lang = data.l === 0 ? 'ru' : 'en';
            this.title = data.gt || ''; // Hydrate Global Title
            const charEntry = CHAR_DATABASE[data.c];
            if (charEntry) {
                const isEn = this.lang === 'en';
                this.char = isEn ? charEntry.enName || charEntry.name : charEntry.name;
                this.frame = isEn ? charEntry.enFrame || charEntry.frame : charEntry.frame;
                this.enFrame = charEntry.enFrame;
                this.element = ELEMENT_NAMES[this.lang][findLocalizedKey(ELEMENT_NAMES, charEntry.element)] || charEntry.element;
                this._class = CLASS_NAMES[this.lang][findLocalizedKey(CLASS_NAMES, charEntry.class)] || charEntry.class;
                this.affix = ELEMENT_NAMES[this.lang][data.a] || data.a || '-';
            }
            this.rank = RANK_OPTIONS[data.r] || '';
            this.posCode = data.pc || '';

            // Weapons/CUB
            this.weaponReal = data.w || '';
            const isEn = this.lang === 'en';
            this.weapon = (this.weaponReal && ASSET_MAP[this.weaponReal.toLowerCase()])
                ? (isEn ? 'SIGNATURE' : 'СИГНАТУРНОЕ')
                : (this.weaponReal || '-');

            this.cubReal = data.cb || '';
            this.cub = (this.cubReal && ASSET_MAP[this.cubReal.toLowerCase()])
                ? (isEn ? 'SIGNATURE' : 'СИГНАТУРНЫЙ')
                : (this.cubReal || '-');

            if (data.b && Array.isArray(data.b)) {
                this.builds = data.b.map(b => ({
                    ...createBuild(),
                    title: b.t || '',
                    mems: (b.m || []).map(idx => MEMORY_NAMES[idx] || ''),
                    harm: MEMORY_NAMES[b.h] || '',
                    resTopSlot: b.rt || '',
                    resTopSkill: b.rts || '',
                    resBotSlot: b.rb || '',
                    resBotSkill: b.rbs || '',
                    desc: b.d || '',
                    wRes: (b.wr || [null, null, null]).map(idx => idx !== null ? WEAPON_RESONANCES[idx] : null)
                }));
            }
            return;
        }

        if (data.lang) this.lang = data.lang;
        this.title = data.title || '';
        this.char = data.char || '';
        this.frame = data.frame || '';
        this.enFrame = data.enFrame || '';
        this.rank = data.rank || '';

        const eKey = findLocalizedKey(ELEMENT_NAMES, data.element);
        this.element = eKey ? ELEMENT_NAMES[this.lang][eKey] : (data.element || '');

        const cKey = findLocalizedKey(CLASS_NAMES, data.class);
        this.class = cKey ? CLASS_NAMES[this.lang][cKey] : (data.class || '');

        // Handle Weapon/CUB (Store real name, display logic handled in component usually)
        const isEn = this.lang === 'en';
        this.weaponReal = data.weapon || '';
        this.weapon = (data.weapon && ASSET_MAP[data.weapon.toLowerCase()])
            ? (isEn ? 'SIGNATURE' : 'СИГНАТУРНОЕ')
            : (data.weapon || '-');

        const aKey = findLocalizedKey(ELEMENT_NAMES, data.affix);
        this.affix = aKey ? ELEMENT_NAMES[this.lang][aKey] : (data.affix || '');

        this.cubReal = data.cub || '';
        this.cub = (data.cub && ASSET_MAP[data.cub.toLowerCase()])
            ? (isEn ? 'SIGNATURE' : 'СИГНАТУРНЫЙ')
            : (data.cub || '-');

        this.posCode = data.posCode || '';

        if (data.builds && Array.isArray(data.builds)) {
            this.builds = data.builds.map(b => ({
                ...createBuild(),
                ...b,
                wRes: b.wRes || [null, null, null]
            }));
        }
    }

    // Modal State
    activeModal = $state(null); // 'char', 'mem', 'wres', 'color'
    modalData = $state(null); // Extra data for the modal (e.g. which slot)

    openModal(name, data = null) {
        this.activeModal = name;
        this.modalData = data;
    }

    closeModal() {
        this.activeModal = null;
        this.modalData = null;
    }
}

export const appState = new AppState();
