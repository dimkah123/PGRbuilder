/**
 * MODALS MODULE
 * Handles memory and character selection modals
 */

import { updateMemCellState } from './builds.js';
import { fillCharacterData } from './autocomplete.js';

let activeMemSlot = null;
let activeSlotIndex = 1;
let MEMORY_FULL_LIST = [];

export function initMemoryList() {
    if (typeof MEMORY_NAMES !== 'undefined') {
        MEMORY_NAMES.sort().forEach(name => {
            for (let i = 1; i <= 3; i++) {
                MEMORY_FULL_LIST.push({
                    name: `${name} - ${i}`,
                    file: `Image/Memories/Memory-${name}-Icon-${i}.webp`,
                    rawName: name,
                    slot: i
                });
            }
        });
    }
}

export function openMemModal(targetImg) {
    activeMemSlot = targetImg;
    const id = targetImg.id;
    if (id.includes('harm')) {
        activeSlotIndex = 1;
    } else {
        const parts = id.split('-m');
        if (parts.length > 1) {
            const slotNum = parseInt(parts[1]);
            if (!isNaN(slotNum)) {
                activeSlotIndex = ((slotNum - 1) % 3) + 1;
            } else {
                activeSlotIndex = 1;
            }
        } else {
            activeSlotIndex = 1;
        }
    }
    document.getElementById('mem-modal').style.display = 'flex';
    document.getElementById('mem-search-input').value = '';
    document.getElementById('mem-search-input').focus();
    renderMemList('');
}

export function closeMemModal() {
    document.getElementById('mem-modal').style.display = 'none';
    activeMemSlot = null;
}

export function renderMemList(filter) {
    const container = document.getElementById('mem-list-container');
    container.innerHTML = '';
    const lowerFilter = filter.toLowerCase();
    const filtered = MEMORY_FULL_LIST.filter(m =>
        m.name.toLowerCase().includes(lowerFilter) &&
        m.slot === activeSlotIndex
    );

    filtered.forEach(m => {
        const div = document.createElement('div');
        div.className = 'mem-option';
        div.innerHTML = `
            <img src="${m.file}" class="mem-opt-img" onerror="this.onerror=null;this.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'">
            <span class="mem-opt-name">${m.rawName}</span>
        `;
        div.onclick = () => selectMemory(m);
        container.appendChild(div);
    });
}

export function selectMemory(memData) {
    if (activeMemSlot) {
        activeMemSlot.src = memData.file;
        activeMemSlot.style.display = 'block';
        const parent = activeMemSlot.parentElement;
        const cell = parent ? parent.parentElement : null;
        if (cell) {
            const input = cell.querySelector('.mem-input, .harm-input');
            if (input) {
                input.value = memData.rawName;
                input.dataset.isSelection = "true";
                input.dispatchEvent(new Event('input', { bubbles: true })); // Trigger standard logic
                updateMemCellState(input);
            }
        }
    }
    closeMemModal();
}

// Char Modal
export function openCharModal() {
    document.getElementById('char-modal').style.display = 'flex';
    document.getElementById('char-search-input').value = '';
    renderCharList('');
    document.getElementById('char-search-input').focus();
}

export function closeCharModal() {
    document.getElementById('char-modal').style.display = 'none';
}

export function renderCharList(filter) {
    if (typeof CHARACTER_IMAGES === 'undefined') return;
    const container = document.getElementById('char-list-container');
    container.innerHTML = '';
    const lowerFilter = filter.toLowerCase();
    const filtered = CHARACTER_IMAGES.filter(img => img.frame.toLowerCase().includes(lowerFilter));

    filtered.forEach(img => {
        const div = document.createElement('div');
        div.className = 'mem-option';
        div.innerHTML = `
            <img src="${img.file}" class="mem-opt-img" onerror="this.onerror=null;this.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'">
            <span class="mem-opt-name">${img.frame}</span>
        `;
        div.onclick = () => selectCharacterImage(img);
        container.appendChild(div);
    });
}

export function selectCharacterImage(imgData) {
    const imgEl = document.getElementById('char-img');
    imgEl.src = imgData.file;
    imgEl.classList.remove('hidden');
    document.getElementById('char-placeholder').style.display = 'none';
    const changeBtn = document.querySelector('.char-change-btn');
    if (changeBtn) changeBtn.style.display = 'flex';

    const dbEntry = CHAR_DATABASE.find(c => c.enFrame && c.enFrame.toLowerCase() === imgData.frame.toLowerCase());
    if (dbEntry) {
        fillCharacterData(dbEntry);
    }
    closeCharModal();
}

export function initModalListeners() {
    // Search inputs in modals
    document.getElementById('char-search-input').addEventListener('input', (e) => renderCharList(e.target.value));
    document.getElementById('mem-search-input').addEventListener('input', (e) => renderMemList(e.target.value));

    // Close Modals on backdrop click
    document.getElementById('mem-modal').addEventListener('click', (e) => {
        if (e.target.id === 'mem-modal') closeMemModal();
    });

    // Click Delegation for Memories
    document.addEventListener('click', (e) => {
        const box = e.target.closest('.mem-box, .harm-slot');
        if (box) {
            const img = box.querySelector('img');
            if (img) openMemModal(img);
        }
    });
}
