import { ASSET_MAP, CHARACTER_IMAGES, CLASS_TO_PREFIX } from './data.js';

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
        console.log(`[AppState] Validating Resonances. Class: ${newClass}, Prefix: ${allowedPrefix}`);

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

                if (!isValid) {
                    console.log(`[AppState] Removing incompatible: ${res.name} (${res.prefix}) != ${allowedPrefix}`);
                }
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

    get elementImg() { return ASSET_MAP[this.element.toLowerCase()] || ''; }
    get classImg() { return ASSET_MAP[this.class.toLowerCase()] || ''; }
    get weaponImg() { return ASSET_MAP[(this.weaponReal || this.weapon).toLowerCase()] || ''; }
    get affixImg() { return ASSET_MAP[this.affix.toLowerCase()] || ''; }
    get cubImg() { return ASSET_MAP[(this.cubReal || this.cub).toLowerCase()] || ''; }

    constructor() {
    }

    addBuild() {
        this.builds.push(createBuild());
    }

    removeBuild(index) {
        this.builds.splice(index, 1);
    }

    serialize() {
        return {
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
        this.char = data.char || '';
        this.frame = data.frame || '';
        this.enFrame = data.enFrame || '';
        this.rank = data.rank || '';
        this.element = data.element || '';
        this.class = data.class || '';

        // Handle Weapon/CUB (Store real name, display logic handled in component usually)
        this.weaponReal = data.weapon || '';
        this.weapon = (data.weapon && ASSET_MAP[data.weapon.toLowerCase()]) ? 'СИГНАТУРНОЕ' : (data.weapon || '-');

        this.affix = data.affix || '';

        this.cubReal = data.cub || '';
        this.cub = (data.cub && ASSET_MAP[data.cub.toLowerCase()]) ? 'СИГНАТУРНЫЙ' : (data.cub || '-');

        this.posCode = data.posCode || '';

        if (data.builds && Array.isArray(data.builds)) {
            this.builds = data.builds;
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
