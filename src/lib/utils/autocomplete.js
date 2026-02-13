import { appState } from '$lib/state.svelte.js';
import { CHAR_DATABASE, ASSET_MAP, CHARACTER_IMAGES, CLASS_TO_PREFIX } from '$lib/data.js';

export function fillCharacterData(charEntry) {
    if (!charEntry) return;

    appState.char = charEntry.name;
    appState.frame = charEntry.frame;
    appState.enFrame = charEntry.enFrame;
    appState.rank = charEntry.rank || 'SSS+';
    appState.element = charEntry.element || '-';
    // class update
    const newClass = charEntry.class || '-';
    appState.class = newClass;

    // Weapon
    if (charEntry.weapon) {
        appState.weaponReal = charEntry.weapon;
        appState.weapon = 'СИГНАТУРНОЕ';
    } else {
        appState.weaponReal = '';
        appState.weapon = '-';
    }

    // CUB
    if (charEntry.cub) {
        appState.cubReal = charEntry.cub;
        appState.cub = 'СИГНАТУРНЫЙ';
    } else {
        appState.cubReal = '';
        appState.cub = '-';
    }

    appState.affix = charEntry.affix || '-';

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
            (c.enFrame && c.enFrame.toLowerCase().includes(lowerQ))
        ).map(c => ({
            label: `${c.name}: ${c.frame}`,
            value: c.frame, // We use Russian frame name as key usually
            data: c
        }));
    }

    // Add other types as needed
    return [];
}
