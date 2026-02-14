import { appState, findLocalizedKey } from '$lib/state.svelte.js';
import { CHAR_DATABASE, ASSET_MAP, CHARACTER_IMAGES, CLASS_TO_PREFIX, ELEMENT_NAMES, CLASS_NAMES } from '$lib/data.js';

export function fillCharacterData(charEntry) {
    if (!charEntry) return;

    const isEn = appState.lang === "en";
    appState.char = isEn ? charEntry.enName || charEntry.name : charEntry.name;
    appState.frame = isEn ? charEntry.enFrame || charEntry.frame : charEntry.frame;
    appState.enFrame = charEntry.enFrame;
    appState.rank = charEntry.rank || 'SSS+';

    // Element update
    const elementKey = findLocalizedKey(ELEMENT_NAMES, charEntry.element);
    appState.element = elementKey ? ELEMENT_NAMES[appState.lang][elementKey] : (charEntry.element || '-');

    // class update
    const classKey = findLocalizedKey(CLASS_NAMES, charEntry.class);
    appState.class = classKey ? CLASS_NAMES[appState.lang][classKey] : (charEntry.class || '-');

    // Weapon
    if (charEntry.weapon) {
        appState.weaponReal = charEntry.weapon;
        appState.weapon = appState.lang === 'ru' ? 'СИГНАТУРНОЕ' : 'SIGNATURE';
    } else {
        appState.weaponReal = '';
        appState.weapon = '-';
    }

    // CUB
    if (charEntry.cub) {
        appState.cubReal = charEntry.cub;
        appState.cub = appState.lang === 'ru' ? 'СИГНАТУРНЫЙ' : 'SIGNATURE';
    } else {
        appState.cubReal = '';
        appState.cub = '-';
    }

    // Affix update
    const affixKey = findLocalizedKey(ELEMENT_NAMES, charEntry.affix);
    appState.affix = affixKey ? ELEMENT_NAMES[appState.lang][affixKey] : (charEntry.affix || '-');

    // Legacy Logic: Moved to AppState.class setter
}


export function findCharacter(query) {
    if (!query) return null;
    const lowerQ = query.toLowerCase();
    return CHAR_DATABASE.find(c =>
        (c.frame && c.frame.toLowerCase() === lowerQ) ||
        (c.enFrame && c.enFrame.toLowerCase() === lowerQ) ||
        (c.name && c.name.toLowerCase() === lowerQ && !c.frame) // fallback if only name matches
    );
}

export function getSuggestions(query, type) {
    if (!query) return [];
    const lowerQ = query.toLowerCase();

    if (type === 'frame') {
        return CHAR_DATABASE.filter(c =>
            (c.frame && c.frame.toLowerCase().includes(lowerQ)) ||
            (c.enFrame && c.enFrame.toLowerCase().includes(lowerQ)) ||
            (c.name && c.name.toLowerCase().includes(lowerQ)) ||
            (c.enName && c.enName.toLowerCase().includes(lowerQ))
        ).map(c => {
            const isEn = appState.lang === "en";
            const name = isEn ? c.enName || c.name : c.name;
            const frame = isEn ? c.enFrame || c.frame : c.frame;
            return {
                label: `${name}: ${frame}`,
                value: frame,
                data: c
            };
        });
    }

    // Add other types as needed
    return [];
}
