/**
 * IMAGE CONTROLS MODULE
 * Handles zoom/pan controls for character image
 */

export function updateCharImg(skipInputUpdate) {
    const s = parseFloat(document.getElementById('scale-ctl').value);
    const x = parseInt(document.getElementById('x-ctl').value);
    const y = parseInt(document.getElementById('y-ctl').value);
    const img = document.getElementById('char-img');
    img.style.transform = `scale(${s}) translate(${x}px, ${y}px)`;

    if (!skipInputUpdate) {
        document.getElementById('pos-code').value = `${s}/${x}/${y}`;
    }
}

export function applyPosCode(code) {
    const parts = code.split('/');
    if (parts.length === 3) {
        const s = parseFloat(parts[0]);
        const x = parseInt(parts[1]);
        const y = parseInt(parts[2]);
        if (!isNaN(s) && !isNaN(x) && !isNaN(y)) {
            document.getElementById('scale-ctl').value = s;
            document.getElementById('x-ctl').value = x;
            document.getElementById('y-ctl').value = y;
            updateCharImg(true);
        }
    }
}

export function initPortraitControls() {
    const portraitArea = document.querySelector('.portrait-area');
    const charImg = document.getElementById('char-img');
    let isDraggingPortrait = false;
    let startX, startY, currentX = 0, currentY = 0, scale = 1;

    if (portraitArea && charImg) {
        const syncFromControls = () => {
            scale = parseFloat(document.getElementById('scale-ctl').value) || 1;
            currentX = parseInt(document.getElementById('x-ctl').value) || 0;
            currentY = parseInt(document.getElementById('y-ctl').value) || 0;
        };
        const syncToControls = () => {
            document.getElementById('scale-ctl').value = Math.round(scale * 100) / 100;
            document.getElementById('x-ctl').value = Math.round(currentX);
            document.getElementById('y-ctl').value = Math.round(currentY);
            document.getElementById('pos-code').value = `${scale.toFixed(2)}/${Math.round(currentX)}/${Math.round(currentY)}`;
        };

        portraitArea.addEventListener('mousedown', (e) => {
            if (e.target !== charImg && e.target !== portraitArea && !e.target.classList.contains('portrait-placeholder')) return;
            e.preventDefault();
            isDraggingPortrait = true;
            syncFromControls();
            startX = e.clientX - currentX;
            startY = e.clientY - currentY;
            portraitArea.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDraggingPortrait) return;
            e.preventDefault();
            currentX = e.clientX - startX;
            currentY = e.clientY - startY;
            charImg.style.transform = `scale(${scale}) translate(${currentX}px, ${currentY}px)`;
            syncToControls();
        });

        document.addEventListener('mouseup', () => {
            if (isDraggingPortrait) {
                isDraggingPortrait = false;
                portraitArea.style.cursor = 'grab';
            }
        });

        portraitArea.addEventListener('wheel', (e) => {
            e.preventDefault();
            syncFromControls();
            const delta = e.deltaY * -0.001;
            scale += delta;
            scale = Math.min(Math.max(0.1, scale), 5);
            charImg.style.transform = `scale(${scale}) translate(${currentX}px, ${currentY}px)`;
            syncToControls();
        }, { passive: false });
    }
}
