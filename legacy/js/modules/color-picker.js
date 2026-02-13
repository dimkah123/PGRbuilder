/**
 * COLOR PICKER MODULE
 * Handles custom HSV color picker
 */

import { formatDoc } from './rich-text.js';

let cpState = { h: 0, s: 100, v: 100 };
let isDraggingCP = false;
let recentColors = [];

export function openCustomPicker() {
    const picker = document.getElementById('custom-color-picker');
    const toolbar = document.querySelector('.rte-toolbar');
    if (toolbar) {
        const rect = toolbar.getBoundingClientRect();
        picker.style.top = (rect.bottom + 45) + 'px';
        picker.style.left = Math.max(5, rect.left) + 'px';
    }
    picker.style.display = 'block';
    document.querySelectorAll('.rte-dropdown').forEach(d => d.classList.remove('active'));
    renderCP();
}

export function closeCustomPicker() {
    const currentHex = document.getElementById('cp-hex-input').value;
    if (currentHex && /^#[0-9A-F]{6}$/i.test(currentHex)) {
        addRecentColor(currentHex);
    }
    document.getElementById('custom-color-picker').style.display = 'none';

    // Reset
    cpState = { h: 0, s: 0, v: 100 };
    document.getElementById('cp-hex-input').value = '#FFFFFF';
    document.getElementById('cp-preview').style.backgroundColor = '#FFFFFF';
    document.getElementById('cp-hue-slider').value = 0;

    const indicator = document.getElementById('current-color-indicator');
    if (indicator) indicator.style.background = '#FFFFFF';
}

function addRecentColor(hex) {
    recentColors = recentColors.filter(c => c.toUpperCase() !== hex.toUpperCase());
    recentColors.unshift(hex);
    if (recentColors.length > 7) recentColors.pop();
    renderRecentColors();
}

export function renderRecentColors() {
    const list = document.getElementById('cp-recent-list');
    if (!list) return;
    list.innerHTML = '';
    recentColors.forEach(hex => {
        const swatch = document.createElement('div');
        swatch.className = 'recent-swatch';
        swatch.style.backgroundColor = hex;
        swatch.title = hex;
        swatch.onmousedown = (e) => {
            e.preventDefault();
            const rgb = hexToRgb(hex);
            const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
            cpState = hsv;
            renderCP(false);
        };
        list.appendChild(swatch);
    });
}

export function applyColor(hex, autoClose = true) {
    formatDoc(null, 'foreColor', hex);
    const indicator = document.getElementById('current-color-indicator');
    if (indicator) indicator.style.background = hex;
    if (autoClose) {
        document.querySelectorAll('.rte-dropdown').forEach(d => d.classList.remove('active'));
        closeCustomPicker();
    }
}

export function toggleDropdown(btn, menuId) {
    const parent = btn.parentElement;
    const wasActive = parent.classList.contains('active');
    document.querySelectorAll('.rte-dropdown').forEach(d => d.classList.remove('active'));
    if (!wasActive) parent.classList.add('active');
}

/* Color Picker Helpers */
export function renderCP(skipRGBUpdate) {
    const satBox = document.getElementById('cp-sat-box');
    satBox.style.backgroundColor = `hsl(${cpState.h}, 100%, 50%)`;

    // Safety check for dimensions
    const w = satBox.getBoundingClientRect().width || 150;
    const h = satBox.getBoundingClientRect().height || 150;

    const cursor = document.getElementById('cp-cursor');
    cursor.style.left = (cpState.s / 100 * w) + 'px';
    cursor.style.top = ((100 - cpState.v) / 100 * h) + 'px';

    const hex = hsvToHex(cpState.h, cpState.s, cpState.v);
    const rgb = hexToRgb(hex);

    document.getElementById('cp-preview').style.backgroundColor = hex;
    const hexInput = document.getElementById('cp-hex-input');
    if (document.activeElement !== hexInput) hexInput.value = hex;

    if (!skipRGBUpdate) {
        document.getElementById('cp-r').value = rgb.r;
        document.getElementById('cp-g').value = rgb.g;
        document.getElementById('cp-b').value = rgb.b;
    }

    // Live apply without closing
    applyColor(hex, false);
}

export function updateSatVal(e, satBox) {
    const rect = satBox.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));
    cpState.s = Math.round((x / rect.width) * 100);
    cpState.v = Math.round(100 - (y / rect.height) * 100);
    renderCP();
}

export function hsvToHex(h, s, v) {
    s /= 100; v /= 100;
    let c = v * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = v - c;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    b = Math.round((b + m) * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
}

export function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

export function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) h = 0;
    else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

export function setCpState(newState) {
    cpState = newState;
}

export function getCpState() {
    return cpState;
}

export function setIsDraggingCP(value) {
    isDraggingCP = value;
}

export function getIsDraggingCP() {
    return isDraggingCP;
}

export function initColorPickerListeners() {
    const hueSlider = document.getElementById('cp-hue-slider');
    if (hueSlider) {
        hueSlider.addEventListener('input', (e) => {
            cpState.h = parseInt(e.target.value);
            renderCP();
        });
    }

    const satBox = document.getElementById('cp-sat-box');
    if (satBox) {
        satBox.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDraggingCP = true;
            updateSatVal(e, satBox);
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (isDraggingCP && satBox) {
            e.preventDefault();
            updateSatVal(e, satBox);
        }
    });

    document.addEventListener('mouseup', () => {
        isDraggingCP = false;
    });

    renderRecentColors();
}
