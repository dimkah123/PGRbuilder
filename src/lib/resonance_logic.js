/**
 * RESONANCE MODULE
 * Handles resonance skills autocomplete and weapon resonance selector
 */

// Suggestions for res-skill-input based on top/bottom resonance
const RES_SKILL_TOP_OPTIONS = ['+15 АТК', 'Red Orb', 'Blue Orb', 'Yellow Orb'];
const RES_SKILL_BOTTOM_OPTIONS = ['Core Passive', 'Signature Move', 'Class Passive'];

// Weapon resonances with class prefix (AT, TA, HE, UN, UNI)
// UN = Universal (all classes), UNI = Vanguard only
export const WEAPON_RESONANCES = [
    { prefix: 'AT', name: 'Glorious Afterglow', file: 'AT - Glorious Afterglow.webp' },
    { prefix: 'HE', name: 'Glorious Spear', file: 'HE - Glorious Spear.webp' },
    { prefix: 'HE', name: 'Honed Gel', file: 'HE - Honed Gel.webp' },
    { prefix: 'HE', name: 'Peaceful Radiant', file: 'HE - Peaceful Radiant.webp' },
    { prefix: 'HE', name: 'Stellar Magnetic Rail', file: 'HE - Stellar Magnetic Rail.webp' },
    { prefix: 'HE', name: 'Superconducting Axial Ray', file: 'HE - Superconducting Axial Ray.webp' },
    { prefix: 'TA', name: 'Absolute Defense', file: 'TA - Absolute Defense.webp' },
    { prefix: 'TA', name: 'Boundaty\'s Annihilation', file: 'TA - Boundaty\'s Annihilation.webp' },
    { prefix: 'TA', name: 'Domain Deconstuction', file: 'TA - Domain Deconstuction.webp' },
    { prefix: 'TA', name: 'Gravity Barrier', file: 'TA - Gravity Barrier.webp' },
    { prefix: 'TA', name: 'Resonant Echo', file: 'TA - Resonant Echo.webp' },
    { prefix: 'UN', name: 'Incandescence', file: 'UN - Incandescence.webp' },
    { prefix: 'UN', name: 'Matrix Lightning', file: 'UN - Matrix Lightning.webp' },
    { prefix: 'UN', name: 'Nsec Transmission', file: 'UN - Nsec Transmission.webp' },
    { prefix: 'UN', name: 'Shock Echo', file: 'UN - Shock Echo.webp' },
    { prefix: 'UN', name: 'Shock Saturation', file: 'UN - Shock Saturation.webp' },
    { prefix: 'UN', name: 'Dead Line Timing', file: 'UN- Dead Line Timing.webp' },
    { prefix: 'UNI', name: 'Overload Signal', file: 'UNI - Overload Signal.webp' }
];

// Map Russian class names to prefixes
export const CLASS_TO_PREFIX = {
    'Атакующий': 'AT',
    'Танк': 'TA',
    'Поддержка': 'HE',
    'Амплифаер': 'HE',
    'Авангард': 'UNI',
    'Наблюдатель': 'UN' // Special case - universal
};

let activeWeaponResBox = null;

export function handleResSkillInput(input) {
    const val = input.value.toLowerCase().trim();
    const row = input.closest('.res-row');
    const group = input.closest('.res-group');
    const parent = row; // Use res-row for positioning

    // Determine if this is top or bottom resonance
    const resCol = input.closest('.res-col');
    const resGroups = resCol ? resCol.querySelectorAll('.res-group') : [];
    const isTopResonance = resGroups[0] === group;

    // Get the correct options list
    const source = isTopResonance ? RES_SKILL_TOP_OPTIONS : RES_SKILL_BOTTOM_OPTIONS;

    // Skip suggestions if this is a programmatic set
    if (input.dataset.isRestoring === "true") {
        input.dataset.isRestoring = "false";
        return;
    }

    // Find or create suggestions box
    let suggestBox = parent.querySelector('.res-skill-suggestions');
    if (!suggestBox) {
        suggestBox = document.createElement('div');
        suggestBox.className = 'res-skill-suggestions suggestions-box';
        parent.style.position = 'relative';
        parent.appendChild(suggestBox);
        suggestBox.style.cssText = `
            position: absolute; width: calc(100% - 25px); max-height: 150px; overflow-y: auto;
            background: #222; border: 1px solid #444; z-index: 1000;
            top: 100%; right: 0; display: none; flex-direction: column;
        `;
    }

    // Filter matches
    const matches = source.filter(k => k.toLowerCase().includes(val));

    if (matches.length > 0) {
        suggestBox.innerHTML = '';
        matches.forEach(match => {
            const div = document.createElement('div');
            div.textContent = match;
            div.style.cssText = 'padding: 5px 8px; cursor: pointer; border-bottom: 1px solid #333; font-size: 0.8rem; color:#ccc;';
            div.onmouseover = () => div.style.background = '#333';
            div.onmouseout = () => div.style.background = 'transparent';
            div.onmousedown = (e) => {
                e.preventDefault();
                input.value = match;
                suggestBox.style.display = 'none';
            };
            suggestBox.appendChild(div);
        });
        suggestBox.style.display = 'flex';
    } else {
        suggestBox.style.display = 'none';
    }
}

export function hideResSkillSuggestions(input) {
    setTimeout(() => {
        const row = input.closest('.res-row');
        if (row) {
            const suggestBox = row.querySelector('.res-skill-suggestions');
            if (suggestBox) suggestBox.style.display = 'none';
        }
    }, 200);
}

export function getCharacterClass() {
    // Try to get the enFrame from the frame input's dataset (most reliable)
    const frameInput = document.querySelector('.frame-name-input');
    if (frameInput && frameInput.dataset.enFrame) {
        const enFrame = frameInput.dataset.enFrame.toLowerCase();
        if (typeof CHAR_DATABASE !== 'undefined') {
            const char = CHAR_DATABASE.find(c =>
                c.enFrame && c.enFrame.toLowerCase() === enFrame
            );
            if (char && char.class) {
                return CLASS_TO_PREFIX[char.class] || null;
            }
        }
    }

    // Fallback: try by name
    const charInput = document.querySelector('#char-name-display');
    if (charInput && charInput.value) {
        const charName = charInput.value.trim().toLowerCase();
        if (typeof CHAR_DATABASE !== 'undefined') {
            const char = CHAR_DATABASE.find(c =>
                c.name.toLowerCase() === charName ||
                c.frame.toLowerCase() === charName ||
                c.enFrame.toLowerCase() === charName
            );
            if (char && char.class) {
                return CLASS_TO_PREFIX[char.class] || null;
            }
        }
    }

    return null;
}

export function openWeaponResSelector(box) {
    activeWeaponResBox = box;
    const img = box.querySelector('img');
    const buildRow = box.closest('.build-row');

    // Get character class
    const charClass = getCharacterClass();

    // Get currently used resonances in this build row
    const usedResonances = [];
    buildRow.querySelectorAll('.weapon-res-box img').forEach(resImg => {
        if (resImg !== img && resImg.dataset.resonance) {
            usedResonances.push(resImg.dataset.resonance);
        }
    });

    // Filter resonances by class
    // UN = available to all, class-specific available to that class or UNI (Vanguard gets all)
    const availableResonances = WEAPON_RESONANCES.filter(res => {
        if (res.prefix === 'UN') return true; // Universal always available
        if (!charClass) return true; // No class selected - show all
        if (charClass === 'UNI') return true; // Vanguard gets all resonances
        return res.prefix === charClass || res.prefix === 'UN';
    });

    // Create or get modal
    let modal = document.getElementById('weapon-res-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'weapon-res-modal';
        modal.innerHTML = `
            <div class="wres-modal-content">
                <div class="wres-modal-header">ВЫБОР РЕЗОНАНСА</div>
                <div class="wres-grid"></div>
                <div class="wres-modal-close" onclick="closeWeaponResModal()">×</div>
            </div>
        `;
        modal.style.cssText = `
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 999999; justify-content: center; align-items: center;
        `;
        document.body.appendChild(modal);
    }

    // Update header with class info
    const header = modal.querySelector('.wres-modal-header');
    header.textContent = charClass ? `ВЫБОР РЕЗОНАНСА:` : 'ВЫБОР РЕЗОНАНСА:';

    // Populate grid
    const grid = modal.querySelector('.wres-grid');
    grid.innerHTML = '';

    availableResonances.forEach(res => {
        const isUsed = usedResonances.includes(res.name);
        const item = document.createElement('div');
        item.className = 'wres-item' + (isUsed ? ' disabled' : '');
        item.innerHTML = `
            <img src="Image/WResonance/${res.file}" alt="${res.name}">
            <span>${res.name}</span>
        `;
        if (!isUsed) {
            item.onclick = () => selectWeaponRes(res.name, res.file);
        }
        grid.appendChild(item);
    });

    modal.style.display = 'flex';
}

export function selectWeaponRes(name, file) {
    if (activeWeaponResBox) {
        const img = activeWeaponResBox.querySelector('img');
        img.src = `Image/WResonance/${file}`;
        img.dataset.resonance = name;

        // Update cell state
        const cell = activeWeaponResBox.closest('.weapon-res-cell');
        if (cell) cell.classList.add('has-item');
    }
    closeWeaponResModal();
}

export function closeWeaponResModal() {
    const modal = document.getElementById('weapon-res-modal');
    if (modal) modal.style.display = 'none';
    activeWeaponResBox = null;
}

export function clearWeaponRes(btn) {
    const cell = btn.closest('.weapon-res-cell');
    const img = cell.querySelector('img');
    if (img) {
        img.removeAttribute('src');
        img.dataset.resonance = '';
    }
    cell.classList.remove('has-item');
}

/**
 * Validates all weapon resonances against the current character class.
 * Removes invalid resonances and shifts remaining ones left.
 */
export function validateResonances() {
    const charClass = getCharacterClass();
    if (!charClass) return; // No class selected, skip validation

    // Process each build row
    document.querySelectorAll('.build-row').forEach(buildRow => {
        const resBoxes = buildRow.querySelectorAll('.weapon-res-box');
        const validResonances = [];

        // Collect valid resonances
        resBoxes.forEach(box => {
            const img = box.querySelector('img');
            if (!img || !img.dataset.resonance) return;

            const resName = img.dataset.resonance;
            const resData = WEAPON_RESONANCES.find(r => r.name === resName);

            if (resData) {
                // Check if resonance is valid for current class
                const isValid = resData.prefix === 'UN' || // Universal
                    resData.prefix === charClass || // Matches class
                    charClass === 'UNI'; // Vanguard gets all

                if (isValid) {
                    validResonances.push({ name: resData.name, file: resData.file });
                }
            }
        });

        // Clear all boxes and refill with valid resonances (shifted left)
        resBoxes.forEach((box, index) => {
            const img = box.querySelector('img');
            const cell = box.closest('.weapon-res-cell');

            if (validResonances[index]) {
                img.src = `Image/WResonance/${validResonances[index].file}`;
                img.dataset.resonance = validResonances[index].name;
                if (cell) cell.classList.add('has-item');
            } else {
                img.src = '';
                img.dataset.resonance = '';
                if (cell) cell.classList.remove('has-item');
            }
        });
    });
}
