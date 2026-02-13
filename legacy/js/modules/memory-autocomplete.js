/**
 * MEMORY AUTOCOMPLETE MODULE
 * Handles autocomplete for memory inputs
 */

import { updateMemCellState } from './builds.js';

export function handleMemInput(input) {
    const val = input.value.toLowerCase().trim();
    const box = input.previousElementSibling;
    const img = box.querySelector('img');
    const parent = input.parentElement;

    let slotIndex = parseInt(img.dataset.slot);
    if (isNaN(slotIndex)) {
        const siblings = Array.from(parent.parentElement.querySelectorAll('.mem-cell'));
        slotIndex = siblings.indexOf(parent) + 1;
        if (slotIndex > 0) img.dataset.slot = slotIndex;
    }

    let memMatch = null;
    if (typeof MEMORY_NAMES !== 'undefined') {
        memMatch = MEMORY_NAMES.find(m => m.toLowerCase() === val);
    }
    if (!memMatch && ASSET_MAP[val]) {
        const path = ASSET_MAP[val];
        const matchName = path.match(/Memory-(.+?)-Icon/);
        if (matchName && matchName[1]) memMatch = matchName[1];
    }

    if (memMatch && !isNaN(slotIndex) && slotIndex > 0) {
        const iconVariant = ((slotIndex - 1) % 3) + 1;
        const newSrc = `Image/Memories/Memory-${memMatch}-Icon-${iconVariant}.webp`;
        img.src = newSrc;
    } else if (ASSET_MAP[val]) {
        img.src = ASSET_MAP[val];
    } else {
        img.removeAttribute('src');
    }

    // Update cell state
    if (input) updateMemCellState(input);

    if (input.dataset.isDrop === "true" || input.dataset.isRestoring === "true" || input.dataset.isSelection === "true") {
        input.dataset.isDrop = "false";
        input.dataset.isSelection = "false";
        return;
    }

    // Suggestions
    let suggestBox = parent.querySelector('.suggestions-box');
    if (!suggestBox) {
        suggestBox = document.createElement('div');
        suggestBox.className = 'suggestions-box';
        parent.appendChild(suggestBox);
        suggestBox.style.cssText = `
            position: absolute; width: 100%; max-height: 150px; overflow-y: auto;
            background: #222; border: 1px solid #444; z-index: 1000;
            top: 100%; left: 0; display: none; flex-direction: column;
        `;
    }

    if (!val) {
        suggestBox.style.display = 'none';
        return;
    }

    const source = (typeof MEMORY_NAMES !== 'undefined') ? MEMORY_NAMES : Object.keys(ASSET_MAP);
    const matches = source.filter(k => k.toLowerCase().includes(val));

    if (matches.length > 0) {
        suggestBox.innerHTML = '';
        matches.slice(0, 10).forEach(match => {
            const div = document.createElement('div');
            div.textContent = match;
            div.style.cssText = 'padding: 5px; cursor: pointer; border-bottom: 1px solid #333; font-size: 0.8rem; color:#ccc;';
            div.onmouseover = () => div.style.background = '#333';
            div.onmouseout = () => div.style.background = 'transparent';
            div.onmousedown = (e) => {
                e.preventDefault();
                input.value = match;
                const key = match.toLowerCase();
                // trigger image update by re-running logic or firing event?
                input.dispatchEvent(new Event('input', { bubbles: true }));
                suggestBox.style.display = 'none';
            };
            suggestBox.appendChild(div);
        });
        suggestBox.style.display = 'flex';
    } else {
        suggestBox.style.display = 'none';
    }
}

export function hideSuggestions(input) {
    setTimeout(() => {
        const parent = input.parentElement;
        const suggestBox = parent.querySelector('.suggestions-box');
        if (suggestBox) suggestBox.style.display = 'none';
    }, 200);
}
