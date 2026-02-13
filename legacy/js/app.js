/**
 * PGR BUILDER APPLICATION - MAIN ENTRY POINT
 * Imports all modules and initializes the application
 */

// ==== MODULE IMPORTS ====
import { updateUILockState, initUILock } from './modules/ui-lock.js';
import { setupAutocomplete, fillCharacterData, triggerMappedInput, previewImage } from './modules/autocomplete.js';
import { addBuildRow, removeBuildRow, reindexBuilds, updateMemCellState, clearMem } from './modules/builds.js';
import { allowDrop, dragMem, dropMem } from './modules/drag-drop.js';
import { handleMemInput, hideSuggestions } from './modules/memory-autocomplete.js';
import {
    handleResSkillInput, hideResSkillSuggestions, getCharacterClass,
    openWeaponResSelector, selectWeaponRes, closeWeaponResModal,
    clearWeaponRes, validateResonances, WEAPON_RESONANCES, CLASS_TO_PREFIX
} from './modules/resonance.js';
import {
    formatDoc, insertSeparator, showToolbar, hideToolbar,
    updateToolbarState, handleRichInput, highlightTermsInEditor,
    initRichTextListeners
} from './modules/rich-text.js';
import { handleExport } from './modules/export.js';
import { setupThemeToggle, autoScale, initScaling } from './modules/theme.js';
import { getAllState, restoreState } from './modules/state.js';
import { saveToCloud, loadFromUrl, updateSaveButtonState } from './modules/cloud-save.js';
import {
    initMemoryList, openMemModal, closeMemModal, renderMemList, selectMemory,
    openCharModal, closeCharModal, renderCharList, selectCharacterImage,
    initModalListeners
} from './modules/modals.js';
import { updateCharImg, applyPosCode, initPortraitControls } from './modules/image-controls.js';
import {
    openCustomPicker, closeCustomPicker, applyColor, toggleDropdown,
    renderCP, updateSatVal, hsvToHex, hexToRgb, rgbToHsv,
    renderRecentColors, initColorPickerListeners
} from './modules/color-picker.js';
import { setCustomSelectValue, initCustomSelectListeners } from './modules/custom-select.js';

// ==== GLOBAL WINDOW EXPORTS (for onclick handlers in HTML) ====

// UI Lock
window.updateUILockState = updateUILockState;

// Autocomplete
window.fillCharacterData = fillCharacterData;
window.previewImage = previewImage;

// Builds
window.removeBuildRow = removeBuildRow;
window.clearMem = clearMem;

// Drag & Drop
window.allowDrop = allowDrop;
window.dragMem = dragMem;
window.dropMem = dropMem;

// Memory Autocomplete
window.handleMemInput = handleMemInput;
window.hideSuggestions = hideSuggestions;

// Resonance
window.handleResSkillInput = handleResSkillInput;
window.hideResSkillSuggestions = hideResSkillSuggestions;
window.openWeaponResSelector = openWeaponResSelector;
window.selectWeaponRes = selectWeaponRes;
window.closeWeaponResModal = closeWeaponResModal;
window.clearWeaponRes = clearWeaponRes;
window.validateResonances = validateResonances;

// Rich Text
window.formatDoc = formatDoc;
window.insertSeparator = insertSeparator;
window.handleRichInput = handleRichInput;

// Export
window.handleExport = handleExport;

// State
window.getAllState = getAllState;
window.restoreState = restoreState;

// Cloud Save
window.saveToCloud = saveToCloud;
window.loadFromUrl = loadFromUrl;

// Modals
window.openMemModal = openMemModal;
window.closeMemModal = closeMemModal;
window.openCharModal = openCharModal;
window.closeCharModal = closeCharModal;

// Image Controls
window.updateCharImg = updateCharImg;
window.applyPosCode = applyPosCode;

// Color Picker
window.openCustomPicker = openCustomPicker;
window.closeCustomPicker = closeCustomPicker;
window.applyColor = applyColor;
window.toggleDropdown = toggleDropdown;

// Custom Select
window.setCustomSelectValue = setCustomSelectValue;

// ==== INITIALIZATION ====

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize Assets (Asset Map)
    if (typeof initializeAssets === 'function') {
        initializeAssets();
    }

    // 2. Initialize Memory List
    initMemoryList();

    // 3. Setup Autocomplete
    const charNameInput = document.getElementById('char-name-display');
    if (charNameInput) setupAutocomplete(charNameInput, 'name');

    const frameNameInput = document.querySelector('.frame-name-input');
    if (frameNameInput) setupAutocomplete(frameNameInput, 'frame');

    // 4. Mapped Input Listeners (Delegated)
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('mapped-input')) {
            const input = e.target;
            const targetId = input.getAttribute('data-target');
            if (targetId) {
                const val = input.value.toLowerCase().trim();
                const img = document.getElementById(targetId);
                if (img) {
                    if (ASSET_MAP[val]) {
                        img.src = ASSET_MAP[val];
                        img.classList.remove('hidden');
                    } else {
                        // Preserve special keywords or hide
                        const safeWords = ['сигнатурное', 'сигнатурный', 'signature'];
                        if (!safeWords.includes(val)) {
                            img.classList.add('hidden');
                        }
                    }
                }
            }
        }
    });

    // 5. Build Rows
    addBuildRow();
    addBuildRow();

    // 6. Buttons & Modals
    const addBuildBtn = document.getElementById('add-build-btn-wide');
    if (addBuildBtn) addBuildBtn.addEventListener('click', addBuildRow);
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) exportBtn.addEventListener('click', handleExport);

    // 7. Initialize Module Listeners
    initUILock();
    initModalListeners();
    initRichTextListeners();
    initColorPickerListeners();
    initCustomSelectListeners();

    // 8. Theme
    setupThemeToggle();

    // 9. AutoScale
    initScaling();

    // 10. Portrait Controls
    initPortraitControls();

    // 11. Add Save/Load Link Button
    const ctrlPanel = document.querySelector('.ctrl-panel');
    if (ctrlPanel) {
        if (!document.getElementById('save-cloud-btn')) {
            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn';
            saveBtn.id = 'save-cloud-btn';
            saveBtn.textContent = 'SAVE LINK';
            saveBtn.onclick = saveToCloud;
            saveBtn.style.marginRight = '10px';
            ctrlPanel.insertBefore(saveBtn, ctrlPanel.firstChild);
        }
    }

    /* Load from URL logic needs to run LAST, after everything is initialized */
    setTimeout(() => {
        loadFromUrl();
    }, 100);
});

// ==== LOADING SCREEN LOGIC ====
window.addEventListener('load', () => {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 500); // Slight delay to ensure smooth visual
    }
});
