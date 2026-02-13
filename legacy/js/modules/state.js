/**
 * STATE MODULE
 * Handles getting and restoring application state
 */

import { addBuildRow } from './builds.js';
import { updateUILockState } from './ui-lock.js';
import { applyPosCode } from './image-controls.js';
// Note: setCustomSelectValue is accessed via window to avoid circular dependencies

export function getAllState() {
    const state = {
        char: document.getElementById('char-name-display').value,
        frame: document.querySelector('.frame-name-input').value,
        enFrame: document.querySelector('.frame-name-input').dataset.enFrame || '',
        rank: document.querySelector('.rank-input').value,
        element: document.querySelector('[data-target="element-img"]').value,
        class: document.querySelector('[data-target="class-img"]').value,
        weapon: document.querySelector('[data-target="weapon-img"]').dataset.realName || '',
        affix: document.querySelector('[data-target="affix-img"]').value,
        cub: document.querySelector('[data-target="cub-img"]').dataset.realName || '',
        posCode: document.getElementById('pos-code').value,
        builds: []
    };

    document.querySelectorAll('.build-row').forEach(row => {
        const build = {
            title: row.querySelector('.build-title input').value,
            mems: [],
            harm: row.querySelector('.harm-input').value,
            resTopSlot: row.querySelectorAll('.res-slot-select')[0].value,
            resTopSkill: row.querySelectorAll('.res-skill-input')[0].value,
            resBotSlot: row.querySelectorAll('.res-slot-select')[1].value,
            resBotSkill: row.querySelectorAll('.res-skill-input')[1].value,
            desc: row.querySelector('.rich-textarea') ? row.querySelector('.rich-textarea').innerHTML : row.querySelector('.tac-text').value
        };
        row.querySelectorAll('.mem-input').forEach(input => {
            build.mems.push(input.value);
        });
        state.builds.push(build);
    });
    return state;
}

export function restoreState(state) {
    if (!state) return;
    document.getElementById('char-name-display').value = state.char || '';
    document.querySelector('.frame-name-input').value = state.frame || '';
    document.querySelector('.rank-input').value = state.rank || '';

    // Update UI Lock State
    updateUILockState();

    const setVal = (sel, val) => {
        const el = document.querySelector(sel);
        if (el) {
            el.value = val || '';
            el.dataset.isRestoring = "true";
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dataset.isRestoring = "false";
        }
    };

    setVal('[data-target="element-img"]', state.element);
    setVal('[data-target="class-img"]', state.class);
    setVal('[data-target="affix-img"]', state.affix);

    if (state.posCode) applyPosCode(state.posCode);

    // Char Image
    if (typeof CHARACTER_IMAGES !== 'undefined') {
        const searchFrame = (state.enFrame || state.frame || '').toLowerCase().trim();
        if (searchFrame) {
            let imgData = CHARACTER_IMAGES.find(i => i.frame.toLowerCase() === searchFrame);
            if (!imgData) imgData = CHARACTER_IMAGES.find(i => i.frame.toLowerCase().includes(searchFrame));
            if (imgData) {
                const imgEl = document.getElementById('char-img');
                if (imgEl) {
                    imgEl.src = imgData.file;
                    imgEl.classList.remove('hidden');
                    document.getElementById('char-placeholder').style.display = 'none';
                    const changeBtn = document.querySelector('.char-change-btn');
                    if (changeBtn) changeBtn.style.display = 'flex';
                }
                const frameInput = document.querySelector('.frame-name-input');
                if (frameInput) frameInput.dataset.enFrame = imgData.frame;
            }
        }
    }

    // Weapon/CUB Logic
    const weaponInput = document.querySelector('[data-target="weapon-img"]');
    const weaponImg = document.getElementById('weapon-img');
    if (weaponInput && state.weapon) {
        const weaponKey = state.weapon.toLowerCase().trim();
        if (ASSET_MAP[weaponKey] && weaponImg) {
            weaponImg.src = ASSET_MAP[weaponKey];
            weaponImg.classList.remove('hidden');
        }
        weaponInput.value = 'СИГНАТУРНОЕ';
        weaponInput.dataset.realName = state.weapon;
    }

    const cubInput = document.querySelector('[data-target="cub-img"]');
    const cubImg = document.getElementById('cub-img');
    if (cubInput && state.cub) {
        const cubKey = state.cub.toLowerCase().trim();
        if (ASSET_MAP[cubKey] && cubImg) {
            cubImg.src = ASSET_MAP[cubKey];
            cubImg.classList.remove('hidden');
        }
        cubInput.value = 'СИГНАТУРНЫЙ';
        cubInput.dataset.realName = state.cub;
    }

    // Builds
    document.getElementById('builds-container').innerHTML = '';
    if (state.builds && state.builds.length > 0) {
        state.builds.forEach(b => {
            addBuildRow();
            const row = document.getElementById('builds-container').lastElementChild;
            if (row) {
                row.querySelector('.build-title input').value = b.title || '';
                const harmInput = row.querySelector('.harm-input');
                if (harmInput) {
                    harmInput.value = b.harm || '';
                    harmInput.dataset.isRestoring = "true";
                    harmInput.dispatchEvent(new Event('input', { bubbles: true }));
                    harmInput.dataset.isRestoring = "false";
                }
                // Update custom dropdowns
                if (typeof window.setCustomSelectValue === 'function') {
                    window.setCustomSelectValue(row, 0, b.resTopSlot || '');
                    window.setCustomSelectValue(row, 1, b.resBotSlot || '');
                } else {
                    // Fallback if helper not ready (rare)
                    row.querySelectorAll('.res-slot-select')[0].value = b.resTopSlot || '';
                    row.querySelectorAll('.res-slot-select')[1].value = b.resBotSlot || '';
                }

                row.querySelectorAll('.res-skill-input')[0].value = b.resTopSkill || '';
                row.querySelectorAll('.res-skill-input')[1].value = b.resBotSkill || '';

                const rte = row.querySelector('.rich-textarea');
                if (rte) rte.innerHTML = b.desc || '';

                const memInputs = row.querySelectorAll('.mem-input');
                b.mems.forEach((m, i) => {
                    if (memInputs[i]) {
                        memInputs[i].value = m || '';
                        memInputs[i].dataset.isRestoring = "true";
                        memInputs[i].dispatchEvent(new Event('input', { bubbles: true }));
                        memInputs[i].dataset.isRestoring = "false";
                    }
                });
            }
        });
    } else {
        addBuildRow();
    }
}
