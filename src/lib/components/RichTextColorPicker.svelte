<script>
    import { onMount } from "svelte";
    import { t } from "$lib/i18n.js";

    let { color = "#FFFFFF", onapply, onclose } = $props();

    // HSV State
    let h = $state(0);
    let s = $state(0);
    let v = $state(100);

    // RGB state
    let r = $state(255);
    let g = $state(255);
    let b = $state(255);

    let hexInput = $state("#FFFFFF");
    let isDragging = false;
    let satBox;

    // Derived
    let currentColor = $derived(hsvToHex(h, s, v));
    let hueColor = $derived(`hsl(${h}, 100%, 50%)`);
    let cursorLeft = $derived(`${s}%`);
    let cursorTop = $derived(`${100 - v}%`);

    // Initialize from props
    $effect(() => {
        // Parse initial color?
        // For simplicity let's stick to defaults or just use the current color if valid
        // Actually on mount we might want to sync
    });

    // Sync RGB -> HSV
    function updateFromRgb() {
        let rNorm = r / 255;
        let gNorm = g / 255;
        let bNorm = b / 255;

        let max = Math.max(rNorm, gNorm, bNorm),
            min = Math.min(rNorm, gNorm, bNorm);
        let hNew,
            sNew,
            vNew = max;
        let d = max - min;
        sNew = max === 0 ? 0 : d / max;

        if (max === min) {
            hNew = 0;
        } else {
            switch (max) {
                case rNorm:
                    hNew = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
                    break;
                case gNorm:
                    hNew = (bNorm - rNorm) / d + 2;
                    break;
                case bNorm:
                    hNew = (rNorm - gNorm) / d + 4;
                    break;
            }
            hNew /= 6;
        }

        h = Math.round(hNew * 360);
        s = Math.round(sNew * 100);
        v = Math.round(vNew * 100);
        hexInput = hsvToHex(h, s, v);
    }

    // Sync Hex -> RGB -> HSV
    function updateFromHex() {
        if (/^#[0-9A-F]{6}$/i.test(hexInput)) {
            let rgb = hexToRgb(hexInput);
            r = rgb.r;
            g = rgb.g;
            b = rgb.b;
            updateFromRgb();
        }
    }

    // Sync HSV -> Hex -> RGB
    $effect(() => {
        // When HSV changes (user drags), update others ONLY if not dragging RGB inputs
        // dragging logic is for sat/val box.
        // We need a flag or check source?
        // Actually reactivity handles it: h,s,v change -> currentColor derived -> we update local R/G/B/Hex
        const hex = hsvToHex(h, s, v);
        // hexInput = hex; // This might conflict if typing hex?
        // Let's rely on explicit updates from interactions

        // We rely on explicit updates for applying
    });

    function hsvToHex(h, s, v) {
        s /= 100;
        v /= 100;
        let c = v * s;
        let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        let m = v - c;
        let r = 0,
            g = 0,
            b = 0;
        if (0 <= h && h < 60) {
            r = c;
            g = x;
            b = 0;
        } else if (60 <= h && h < 120) {
            r = x;
            g = c;
            b = 0;
        } else if (120 <= h && h < 180) {
            r = 0;
            g = c;
            b = x;
        } else if (180 <= h && h < 240) {
            r = 0;
            g = x;
            b = c;
        } else if (240 <= h && h < 300) {
            r = x;
            g = 0;
            b = c;
        } else if (300 <= h && h < 360) {
            r = c;
            g = 0;
            b = x;
        }

        let R = Math.round((r + m) * 255);
        let G = Math.round((g + m) * 255);
        let B = Math.round((b + m) * 255);

        return `#${R.toString(16).padStart(2, "0")}${G.toString(16).padStart(2, "0")}${B.toString(16).padStart(2, "0")}`.toUpperCase();
    }

    function hexToRgb(hex) {
        hex = hex.replace(/^#/, "");
        const bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255,
        };
    }

    let cachedRect = null;

    function updateSatVal(e) {
        if (!cachedRect) return; // cache is mandatory for drag
        const rect = cachedRect;
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));

        s = Math.round((x / rect.width) * 100);
        v = Math.round(100 - (y / rect.height) * 100);

        // Update derivatives
        let hex = hsvToHex(h, s, v);
        hexInput = hex;
        let rgb = hexToRgb(hex);
        r = rgb.r;
        g = rgb.g;
        b = rgb.b;

        apply(); // Live apply for dragging
    }

    function handleMouseDown(e) {
        e.preventDefault();
        if (satBox) {
            cachedRect = satBox.getBoundingClientRect();
        }
        isDragging = true;
        updateSatVal(e);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    }

    function handleMouseMove(e) {
        if (isDragging) updateSatVal(e);
    }

    function handleMouseUp() {
        isDragging = false;
        cachedRect = null;
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    }

    function apply() {
        onapply(currentColor);
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="cp-panel"
    onclick={(e) => e.stopPropagation()}
    onmousedown={(e) => e.stopPropagation()}
    oncontextmenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
    }}
>
    <!-- Sat/Val Box -->
    <div
        class="cp-sat-box"
        bind:this={satBox}
        style="background-color: {hueColor};"
        onmousedown={handleMouseDown}
    >
        <div class="cp-white"></div>
        <div class="cp-black"></div>
        <div
            class="cp-cursor"
            style="left: {cursorLeft}; top: {cursorTop};"
        ></div>
    </div>

    <!-- Hue Slider -->
    <input
        name="cp-hue"
        type="range"
        min="0"
        max="360"
        class="cp-hue-slider"
        bind:value={h}
        oninput={() => {
            let hex = hsvToHex(h, s, v);
            hexInput = hex;
            let rgb = hexToRgb(hex);
            r = rgb.r;
            g = rgb.g;
            b = rgb.b;
            apply();
        }}
    />

    <div class="cp-controls">
        <!-- RGB Inputs -->
        <div class="cp-rgb-row">
            <div class="cp-col">
                <span class="cp-label">R</span>
                <input
                    name="cp-red"
                    type="number"
                    min="0"
                    max="255"
                    class="cp-num-input"
                    bind:value={r}
                    onchange={() => {
                        updateFromRgb();
                        apply();
                    }}
                />
            </div>
            <div class="cp-col">
                <span class="cp-label">G</span>
                <input
                    name="cp-green"
                    type="number"
                    min="0"
                    max="255"
                    class="cp-num-input"
                    bind:value={g}
                    onchange={() => {
                        updateFromRgb();
                        apply();
                    }}
                />
            </div>
            <div class="cp-col">
                <span class="cp-label">B</span>
                <input
                    name="cp-blue"
                    type="number"
                    min="0"
                    max="255"
                    class="cp-num-input"
                    bind:value={b}
                    onchange={() => {
                        updateFromRgb();
                        apply();
                    }}
                />
            </div>
            <div class="cp-col" style="justify-content: flex-end;">
                <!-- EyeDropper Removed -->
            </div>
        </div>

        <!-- Hex and Preview -->
        <div class="cp-row">
            <div
                class="cp-preview"
                style="background-color: {currentColor};"
            ></div>
            <input
                name="cp-hex"
                type="text"
                class="cp-hex-input"
                bind:value={hexInput}
                onchange={() => {
                    updateFromHex();
                    apply();
                }}
                onkeydown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        updateFromHex();
                        apply();
                    }
                }}
            />
        </div>

        <!-- Recent Colors (Not implemented in this view, likely passed as props if needed, or kept simple) -->
        <div class="cp-row" style="margin-top:5px;">
            <span class="cp-label" style="margin-right:5px; line-height:20px;"
                >{t("recent")} :</span
            >
        </div>
    </div>
</div>

<style>
    .cp-panel {
        background: #111;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 10px;
        width: 220px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        gap: 8px;
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 10002;
        margin-top: 5px;
        user-select: none;
        -webkit-user-select: none;
    }

    .cp-sat-box {
        width: 100%;
        height: 120px;
        position: relative;
        cursor: crosshair;
        border: 1px solid #333;
        border-radius: 4px;
        overflow: hidden;
    }
    .cp-white {
        background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
        width: 100%;
        height: 100%;
        position: absolute;
        pointer-events: none;
    }
    .cp-black {
        background: linear-gradient(to top, #000, rgba(0, 0, 0, 0));
        width: 100%;
        height: 100%;
        position: absolute;
        pointer-events: none;
    }

    .cp-cursor {
        width: 10px;
        height: 10px;
        border: 2px solid #fff;
        border-radius: 50%;
        position: absolute;
        transform: translate(-5px, -5px);
        box-shadow: 0 0 2px #000;
        pointer-events: none;
    }

    .cp-hue-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 8px;
        border-radius: 4px;
        background: linear-gradient(
            to right,
            #f00 0%,
            #ff0 17%,
            #0f0 33%,
            #0ff 50%,
            #00f 67%,
            #f0f 83%,
            #f00 100%
        );
        outline: none;
        cursor: pointer;
        border: 1px solid #333;
        margin: 0;
    }
    .cp-hue-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: transparent;
        border: 2px solid #fff;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
        cursor: pointer;
        margin-top: -1px; /* Align? slider height 8px thumb 14px */
    }

    .cp-rgb-row {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 30px;
        gap: 5px;
        margin-bottom: 8px;
        align-items: end;
    }
    .cp-col {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .cp-label {
        color: #888;
        font-family: monospace;
        font-size: 0.7rem;
        margin-bottom: 2px;
        font-weight: bold;
    }
    .cp-num-input {
        width: 100%;
        background: #222;
        border: 1px solid #444;
        color: #fff;
        text-align: center;
        padding: 4px 0;
        border-radius: 4px;
        font-size: 0.75rem;
        /* No spinners */
        -moz-appearance: textfield;
        appearance: textfield;
    }
    .cp-num-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        appearance: none;
        margin: 0;
    }

    .cp-row {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    .cp-hex-input {
        flex: 1;
        background: #111;
        border: 1px solid #444;
        color: #fff;
        padding: 5px;
        font-family: monospace;
        text-align: center;
        font-size: 0.8rem;
        border-radius: 4px;
    }
    .cp-preview {
        width: 30px;
        height: 26px;
        border: 1px solid #444;
        border-radius: 4px;
    }
</style>
