/**
 * DRAG AND DROP MODULE
 * Handles memory drag & drop functionality
 */

import { updateMemCellState } from './builds.js';

export function allowDrop(ev) {
    ev.preventDefault();
}

export function dragMem(ev) {
    const img = ev.target;
    if (img.src && img.style.display !== 'none') {
        ev.dataTransfer.setData("memSrc", img.src);
        const input = img.parentElement.nextElementSibling;
        ev.dataTransfer.setData("memName", input.value);
    } else {
        ev.preventDefault();
    }
}

export function dropMem(ev, targetBox) {
    ev.preventDefault();
    const src = ev.dataTransfer.getData("memSrc");
    const name = ev.dataTransfer.getData("memName");

    if (src && name) {
        const img = targetBox.querySelector('img');
        const input = targetBox.nextElementSibling;
        img.src = src;
        input.value = name;
        input.dataset.isDrop = "true";
        input.dispatchEvent(new Event('input', { bubbles: true }));
        // Update state
        updateMemCellState(input);
    }
}
