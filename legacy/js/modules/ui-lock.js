/**
 * UI LOCKING MODULE
 * Locks/unlocks UI elements based on character selection state
 */

export function updateUILockState() {
    const charNameInput = document.getElementById('char-name-display');
    const isCharSelected = charNameInput && charNameInput.value.trim() !== "";

    // Elements to lock
    const elementsToLock = [
        document.querySelector('.char-info'), // Left panel stats
        document.querySelector('.right-panel') // Right panel builds
    ];

    elementsToLock.forEach(el => {
        if (el) {
            if (isCharSelected) {
                el.classList.remove('ui-locked');
            } else {
                el.classList.add('ui-locked');
            }
        }
    });

    // Also handle input fields if needed specifically
    const inputs = document.querySelectorAll('.char-info input, .right-panel input');
    inputs.forEach(inp => {
        if (isCharSelected) {
            inp.removeAttribute('disabled');
        } else {
            // Optional: disable inputs explicitly if pointer-events: none isn't enough for keyboard nav
            // inp.setAttribute('disabled', 'true'); 
        }
    });
}

// Init lock state on DOMContentLoaded
export function initUILock() {
    updateUILockState();
}
