import { ASSET_MAP, CHARACTER_IMAGES, CLASS_TO_PREFIX, CHAR_DATABASE, ELEMENT_NAMES, CLASS_NAMES } from './data.js';

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

class AppState {
    // Character Info
    char = $state('');
    frame = $state('');
    enFrame = $state('');
    rank = $state('');

    // Stats
    element = $state('-');
    _class = $state('-');

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
        const elementKey = Object.keys(ELEMENT_NAMES[oldLang]).find(k => ELEMENT_NAMES[oldLang][k] === this.element);
        if (elementKey) {
            this.element = ELEMENT_NAMES[this.lang][elementKey];
        }

        // Migrate Class
        const classKey = Object.keys(CLASS_NAMES[oldLang]).find(k => CLASS_NAMES[oldLang][k] === this._class);
        if (classKey) {
            this._class = CLASS_NAMES[this.lang][classKey];
        }

        // Migrate Affix
        const affixKey = Object.keys(ELEMENT_NAMES[oldLang]).find(k => ELEMENT_NAMES[oldLang][k] === this.affix);
        if (affixKey) {
            this.affix = ELEMENT_NAMES[this.lang][affixKey];
        }

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
        }
    }

    addBuild() {
        this.builds.push(createBuild());
    }

    removeBuild(index) {
        this.builds.splice(index, 1);
    }

    serialize() {
        return {
            lang: this.lang,
            char: this.char,
            frame: this.frame,
            enFrame: this.enFrame,
            rank: this.rank,
            element: this.element,
            class: this.class,
            weapon: this.weaponReal || this.weapon,
            affix: this.affix,
            cub: this.cubReal || this.cub,
            posCode: this.posCode,
            builds: $state.snapshot(this.builds)
        };
    }

    hydrate(data) {
        if (!data) return;
        if (data.lang) this.lang = data.lang;
        this.char = data.char || '';
        this.frame = data.frame || '';
        this.enFrame = data.enFrame || '';
        this.rank = data.rank || '';
        this.element = data.element || '';
        this.class = data.class || '';

        // Handle Weapon/CUB (Store real name, display logic handled in component usually)
        const isEn = this.lang === 'en';
        this.weaponReal = data.weapon || '';
        this.weapon = (data.weapon && ASSET_MAP[data.weapon.toLowerCase()])
            ? (isEn ? 'SIGNATURE' : 'СИГНАТУРНОЕ')
            : (data.weapon || '-');

        this.affix = data.affix || '';

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
