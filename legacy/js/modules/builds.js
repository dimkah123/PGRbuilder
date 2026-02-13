/**
 * BUILDS MODULE
 * Handles build row creation, deletion, and memory cell management
 */

export function addBuildRow() {
    const container = document.getElementById('builds-container');
    if (!container) return;

    const currentCount = document.querySelectorAll('.build-row').length;
    const nextNum = currentCount + 1;
    const numStr = nextNum < 10 ? `0${nextNum}` : nextNum;
    const rowId = `build-${Date.now()}`;

    const rowHtml = `
        <div class="build-row adding" id="${rowId}">
            <div class="build-title">
                <span class="build-num">${numStr}</span> // <input type="text" name="${rowId}-setName" value="" placeholder="НАЗВАНИЕ СЕТА" autocomplete="off">
            </div>

            <!-- 1. Memories -->
            <div class="mem-grid">
                ${[1, 2, 3, 4, 5, 6].map(i => `
            <div class="mem-cell" style="position:relative;">
                <div class="mem-remove-btn" onclick="clearMem(this)">×</div>
                <div class="mem-box" ondrop="dropMem(event, this)" ondragover="allowDrop(event)">
                    <img id="${rowId}-m${i}" data-slot="${i}" draggable="true" ondragstart="dragMem(event)">
                </div>
                <input type="text" class="mem-input" name="${rowId}-mem${i}" placeholder="МЕМ" 
                       autocomplete="off"
                       oninput="handleMemInput(this)" 
                       onfocus="handleMemInput(this)"
                       onblur="hideSuggestions(this)">
            </div>`).join('')}
            </div>

            <!-- 2. Harmony -->
            <div class="harm-col" style="position:relative;">
                <div class="mem-remove-btn" onclick="clearMem(this)">×</div>
                <div class="harm-slot" ondrop="dropMem(event, this)" ondragover="allowDrop(event)">
                    <img id="${rowId}-harm" data-slot="1" draggable="true" ondragstart="dragMem(event)">
                </div>
                <input type="text" class="harm-input" name="${rowId}-harm" placeholder="ГАРМ" 
                       autocomplete="off"
                       oninput="handleMemInput(this)" 
                       onfocus="handleMemInput(this)"
                       onblur="hideSuggestions(this)">
            </div>

            <!-- 3. Resonance -->
            <div class="res-col">
                <div class="res-group">
                    <div class="res-label">ВЕРХ. РЕЗОНАНС</div>
                    <div class="res-row">
                        <div class="custom-res-select" tabindex="0">
                            <div class="res-select-trigger">—</div>
                            <div class="res-select-options">
                                <div class="res-select-option" data-value="">—</div>
                                <div class="res-select-option" data-value="1">1x</div>
                                <div class="res-select-option" data-value="2">2x</div>
                                <div class="res-select-option" data-value="3">3x</div>
                                <div class="res-select-option" data-value="4">4x</div>
                                <div class="res-select-option" data-value="5">5x</div>
                                <div class="res-select-option" data-value="6">6x</div>
                            </div>
                            <input type="hidden" class="res-slot-select" name="${rowId}-resTopVal" value="">
                        </div>
                        <input class="res-skill-input" name="${rowId}-resTopSkill" placeholder="НАВЫК" autocomplete="off" oninput="handleResSkillInput(this)" onfocus="handleResSkillInput(this)" onblur="hideResSkillSuggestions(this)">
                    </div>
                </div>
                <div class="res-group">
                    <div class="res-label">НИЖН. РЕЗОНАНС</div>
                    <div class="res-row">
                        <div class="custom-res-select" tabindex="0">
                            <div class="res-select-trigger">—</div>
                            <div class="res-select-options">
                                <div class="res-select-option" data-value="">—</div>
                                <div class="res-select-option" data-value="1">1x</div>
                                <div class="res-select-option" data-value="2">2x</div>
                                <div class="res-select-option" data-value="3">3x</div>
                                <div class="res-select-option" data-value="4">4x</div>
                                <div class="res-select-option" data-value="5">5x</div>
                                <div class="res-select-option" data-value="6">6x</div>
                            </div>
                            <input type="hidden" class="res-slot-select" name="${rowId}-resBotVal" value="">
                        </div>
                        <input class="res-skill-input" name="${rowId}-resBotSkill" placeholder="НАВЫК" autocomplete="off" oninput="handleResSkillInput(this)" onfocus="handleResSkillInput(this)" onblur="hideResSkillSuggestions(this)">
                    </div>
                </div>
                
                <!-- Weapon Resonance -->
                <div class="weapon-res-group">
                    <div class="res-label">РЕЗОНАНСЫ ОРУЖИЯ</div>
                    <div class="weapon-res-row">
                        ${[1, 2, 3].map(i => `
                        <div class="weapon-res-cell">
                            <div class="mem-remove-btn" onclick="clearWeaponRes(this)">×</div>
                            <div class="weapon-res-box" onclick="openWeaponResSelector(this)">
                                <img id="${rowId}-wres${i}" data-slot="${i}" data-resonance="">
                            </div>
                        </div>`).join('')}
                    </div>
                </div>
            </div>

            <!-- 4. Description -->
            <div class="tac-box">
                <div class="corner-bracket cb-tl"></div>
                <div class="corner-bracket cb-br"></div>
                <div class="tac-header">ТАКТИЧЕСКИЙ АНАЛИЗ</div>
                
                <div class="rich-editor-container">
                    <div class="rich-textarea" contenteditable="true" 
                         placeholder="Введите тактическое описание..." 
                         oninput="handleRichInput(this)"></div>
                </div>
            </div>

            <!-- 5. Delete -->
            <div class="btn-del" onclick="removeBuildRow('${rowId}')">×</div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', rowHtml);

    // Remove adding class after animation
    const newRow = document.getElementById(rowId);
    if (newRow) {
        newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => {
            newRow.classList.remove('adding');
        }, 300);
    }
}

export function removeBuildRow(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.add('removing');
    setTimeout(() => {
        el.remove();
        reindexBuilds();
    }, 300); // Wait for animation
}

export function reindexBuilds() {
    const rows = document.querySelectorAll('.build-row');
    rows.forEach((row, index) => {
        const num = index + 1;
        const numStr = num < 10 ? `0${num}` : num;
        const titleSpan = row.querySelector('.build-title .build-num');
        if (titleSpan) titleSpan.textContent = numStr;
    });
}

export function updateMemCellState(input) {
    const cell = input.closest('.mem-cell, .harm-col'); // Also check harm-col for harmony input
    if (!cell) return;

    // Check if input has value OR image is visible/set
    const img = cell.querySelector('img');
    const hasImage = img && img.getAttribute('src') && img.getAttribute('src') !== '';
    const hasText = input.value && input.value.trim() !== '';

    if (hasImage || hasText) {
        cell.classList.add('has-item');
    } else {
        cell.classList.remove('has-item');
    }
}

export function clearMem(btn) {
    const cell = btn.closest('.mem-cell, .harm-col');
    if (!cell) return;

    const input = cell.querySelector('.mem-input, .harm-input');
    const img = cell.querySelector('img');

    // Clear Image
    if (img) {
        img.removeAttribute('src');
    }

    // Clear Input
    if (input) {
        input.value = "";
        // Dispatch input event to trigger any other listeners, but we manually handled the visuals
        updateMemCellState(input); // Ensure state is updated immediately
    }
}
