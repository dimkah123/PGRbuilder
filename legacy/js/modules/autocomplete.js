/**
 * AUTOCOMPLETE MODULE
 * Handles character autocomplete and form filling
 */

import { updateUILockState } from './ui-lock.js';
import { validateResonances } from './resonance.js';

export function setupAutocomplete(input, type) {
    let currentFocus;

    // Wrap input if not already wrapped
    if (!input.parentElement.classList.contains('autocomplete-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('autocomplete-wrapper');
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
    }

    input.addEventListener("input", function (e) {
        let a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;

        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);

        const searchVal = val.toLowerCase();

        let matches = CHAR_DATABASE.filter(item => {
            const matchName = item.name.toLowerCase().includes(searchVal);
            const matchFrame = item.frame.toLowerCase().includes(searchVal);
            const matchEn = item.enFrame && item.enFrame.toLowerCase().includes(searchVal);
            return matchName || matchFrame || matchEn;
        }).map(item => ({
            display: `${item.name}: ${item.frame}`,
            value: item.name,
            frameVal: item.frame,
            full: item
        }));

        for (i = 0; i < matches.length; i++) {
            b = document.createElement("DIV");
            b.classList.add('autocomplete-item');
            const regex = new RegExp("(" + val + ")", "gi");
            b.innerHTML = matches[i].display.replace(regex, "<strong>$1</strong>");
            b.innerHTML += "<input type='hidden' value='" + matches[i].value + "'>";

            const matchData = matches[i];

            b.addEventListener("click", function (e) {
                if (matchData.full) {
                    fillCharacterData(matchData.full);
                } else {
                    input.value = this.getElementsByTagName("input")[0].value;
                }
                closeAllLists();
            });
            a.appendChild(b);
        }
    });

    input.addEventListener("keydown", function (e) {
        let x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) { // DOWN
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) { // UP
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) { // ENTER
            e.preventDefault();
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        for (let i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != input) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

export function fillCharacterData(data) {
    // 1. Name
    document.getElementById('char-name-display').value = data.name;

    // Frame
    const frameInput = document.querySelector('.frame-name-input');
    if (frameInput) {
        frameInput.value = data.frame;
        frameInput.dataset.enFrame = data.enFrame || '';
    }

    // 2. Rank
    const rankInput = document.querySelector('.rank-input');
    if (rankInput) rankInput.value = data.rank;

    // 3. Element
    triggerMappedInput('element-img', data.element);

    // 4. Class
    triggerMappedInput('class-img', data.class);

    // 5. Weapon
    const weaponName = (data.weapon || "").toLowerCase().trim();
    const weaponImgEl = document.getElementById('weapon-img');
    if (weaponName && ASSET_MAP[weaponName] && weaponImgEl) {
        weaponImgEl.src = ASSET_MAP[weaponName];
        weaponImgEl.classList.remove('hidden');
    } else if (weaponImgEl) {
        weaponImgEl.classList.add('hidden');
    }

    const weaponLabel = data.weapon ? "СИГНАТУРНОЕ" : "НЕТ";
    const weaponInput = document.querySelector('[data-target="weapon-img"]');
    if (weaponInput) {
        weaponInput.value = weaponLabel;
        weaponInput.dataset.realName = data.weapon || '';
    }

    // 6. Affix
    triggerMappedInput('affix-img', data.affix);

    // 7. CUB
    const cubName = (data.cub || "").toLowerCase().trim();
    const cubImgEl = document.getElementById('cub-img');
    if (cubName && ASSET_MAP[cubName] && cubImgEl) {
        cubImgEl.src = ASSET_MAP[cubName];
        cubImgEl.classList.remove('hidden');
    } else if (cubImgEl) {
        cubImgEl.classList.add('hidden');
    }

    const cubLabel = data.cub ? "СИГНАТУРНЫЙ" : "НЕТ";
    const cubInput = document.querySelector('[data-target="cub-img"]');
    if (cubInput) {
        cubInput.value = cubLabel;
        cubInput.dataset.realName = data.cub || '';
    }

    // 8. Image Sync
    if (data.enFrame && typeof CHARACTER_IMAGES !== 'undefined') {
        const charImg = CHARACTER_IMAGES.find(img => img.frame.toLowerCase() === data.enFrame.toLowerCase());
        if (charImg) {
            const imgEl = document.getElementById('char-img');
            imgEl.src = charImg.file;
            imgEl.classList.remove('hidden');
            document.getElementById('char-placeholder').style.display = 'none';
        }
    }

    // Update UI Lock State
    updateUILockState();

    // Validate resonances for new class
    validateResonances();
}

export function triggerMappedInput(imgId, value) {
    if (!value) value = "НЕТ";
    const input = document.querySelector(`[data-target="${imgId}"]`);
    if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// Image preview function
export function previewImage(input, imgId, placeholderId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.getElementById(imgId);
            img.src = e.target.result;
            img.classList.remove('hidden');
            if (placeholderId) document.getElementById(placeholderId).style.display = 'none';
            const changeBtn = document.querySelector('.char-change-btn');
            if (changeBtn) changeBtn.style.display = 'flex';
        }
        reader.readAsDataURL(input.files[0]);
    }
}
