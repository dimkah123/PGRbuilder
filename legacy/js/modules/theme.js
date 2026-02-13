/**
 * THEME & SCALING MODULE
 * Handles theme toggle and auto-scaling
 */

export function setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            // Add transition class to body
            document.body.classList.add('changing-theme');

            document.body.classList.toggle('light-theme');

            if (document.body.classList.contains('light-theme')) {
                themeBtn.textContent = "DARK MODE";
                themeBtn.style.background = "#fff";
                themeBtn.style.color = "#000";
            } else {
                themeBtn.textContent = "LIGHT MODE";
                themeBtn.style.background = "#000";
                themeBtn.style.color = "#fff";
            }

            // Remove transition class after animation (0.5s)
            setTimeout(() => {
                document.body.classList.remove('changing-theme');
            }, 550);
        });
    }
}

export function autoScale() {
    const container = document.querySelector('.app-container');
    const winW = window.innerWidth;
    const containerW = 1900;

    if (winW < containerW && winW > 1000) {
        const scale = winW / containerW;
        container.style.transform = `scale(${scale})`;
        container.style.transformOrigin = 'top center';
        // Remove zoom just in case
        container.style.zoom = '';
    } else {
        container.style.transform = 'none';
        container.style.zoom = '';
    }
}

export function initScaling() {
    autoScale();
    window.addEventListener('resize', autoScale);
}
