<script>
    import { appState } from "$lib/state.svelte.js";

    // HSV State
    let h = $state(0);
    let s = $state(0);
    let v = $state(100);

    // Constants
    const RECENT_LIMIT = 7;
    let recentColors = $state(["#FFFFFF", "#FF0000", "#00FF00", "#0000FF"]);
    let hexInput = $state("#FFFFFF");

    // UI Refs
    let satBox = $state(null);
    let isDragging = false;

    // Derived
    // Derived
    let currentColor = $derived(hsvToHex(h, s, v));
    let hueColor = $derived(`hsl(${h}, 100%, 50%)`);
    let cursorLeft = $derived(`${s}%`);
    let cursorTop = $derived(`${100 - v}%`);

    let r = $state(255);
    let g = $state(255);
    let b = $state(255);

    $effect(() => {
        // Update RGB when HSV changes
        const hex = hsvToHex(h, s, v);
        const rgb = hexToRgb(hex);
        // Only update if not currently editing RGB to avoid loops?
        // Actually we can just sync them.
        r = rgb.r;
        g = rgb.g;
        b = rgb.b;
        hexInput = hex;
    });

    function hexToRgb(hex) {
        hex = hex.replace(/^#/, "");
        const bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255,
        };
    }

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
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
    }

    // ... helper functions ...

    function updateFromRgb() {
        // Convert RGB to HSV
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
            hNew = 0; // achromatic
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
    }

    // ...
</script>

<!-- Template -->
{#if appState.activeModal === "color"}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-backdrop" onclick={close}>
        <div class="modal-content" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">ВЫБОР ЦВЕТА</div>

            <div class="cp-container">
                <!-- Sat/Val Box -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
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
                    type="range"
                    min="0"
                    max="360"
                    class="cp-hue-slider"
                    bind:value={h}
                />

                <!-- Controls -->
                <div class="cp-controls">
                    <!-- Hex Input Row -->
                    <div class="cp-row">
                        <input
                            type="text"
                            class="cp-hex-input"
                            bind:value={hexInput}
                            readonly
                        />
                        <div
                            class="cp-preview"
                            style="background-color: {currentColor};"
                        ></div>
                        <button class="btn" onclick={applyColor}>APPLY</button>
                    </div>

                    <!-- RGB Row -->
                    <div class="cp-rgb-row">
                        <div class="cp-col">
                            <span>R</span>
                            <input
                                type="number"
                                min="0"
                                max="255"
                                class="cp-num-input"
                                bind:value={r}
                                oninput={updateFromRgb}
                            />
                        </div>
                        <div class="cp-col">
                            <span>G</span>
                            <input
                                type="number"
                                min="0"
                                max="255"
                                class="cp-num-input"
                                bind:value={g}
                                oninput={updateFromRgb}
                            />
                        </div>
                        <div class="cp-col">
                            <span>B</span>
                            <input
                                type="number"
                                min="0"
                                max="255"
                                class="cp-num-input"
                                bind:value={b}
                                oninput={updateFromRgb}
                            />
                        </div>
                        <div class="cp-col">
                            <!-- Helper visual -->
                            <span style="opacity:0">.</span>
                        </div>
                    </div>
                </div>

                <!-- Recent -->
                <div class="cp-recent">
                    {#each recentColors as col}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div
                            class="recent-swatch"
                            style="background-color: {col};"
                            onclick={() => {
                                // Set hex, trigger rgb/hsv update logic
                                let rgb = hexToRgb(col);
                                r = rgb.r;
                                g = rgb.g;
                                b = rgb.b;
                                updateFromRgb();
                            }}
                        ></div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    /* ... existing styles ... */
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5); /* Legacy was likely this */
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .modal-content {
        background: #111; /* Darker background */
        border: 1px solid #333;
        padding: 15px;
        width: 250px; /* Narrower like legacy */
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
    }
    /* Header matches */
    .modal-header {
        font-family: var(--font-header);
        color: #ccc;
        font-size: 0.9rem;
        border-bottom: 1px solid #444;
        padding-bottom: 5px;
        margin-bottom: 5px;
    }

    .cp-sat-box {
        width: 100%;
        height: 150px;
        position: relative;
        cursor: crosshair;
        border: 1px solid #333;
        margin-bottom: 15px;
    }
    .cp-white,
    .cp-black {
        width: 100%;
        height: 100%;
        position: absolute;
        pointer-events: none;
    }
    .cp-white {
        background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
    }
    .cp-black {
        background: linear-gradient(to top, #000, rgba(0, 0, 0, 0));
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
        height: 10px;
        border-radius: 5px;
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
        margin-bottom: 15px;
        cursor: pointer;
        border: 1px solid #333;
    }
    .cp-hue-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: transparent; /* Legacy style */
        border: 2px solid #fff;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
        cursor: pointer;
    }

    .cp-row {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
    }

    .cp-hex-input {
        flex: 1;
        background: #111;
        border: 1px solid #444;
        color: #fff;
        padding: 5px;
        font-family: monospace;
        text-align: center;
    }

    .cp-preview {
        width: 30px;
        height: 30px;
        border: 1px solid #444;
        /* moved to end of input row */
    }

    .btn {
        background: #000;
        border: 1px solid #333;
        color: #fff;
        font-family: var(--font-header);
        cursor: pointer;
        text-transform: uppercase;
        font-size: 0.8rem;
        padding: 0 10px;
    }
    .btn:hover {
        border-color: #ff3333;
        color: #ff3333;
    }

    .cp-rgb-row {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 30px;
        gap: 8px;
        margin-bottom: 12px;
        align-items: end;
    }
    .cp-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: monospace;
        font-size: 0.7rem;
        color: #888;
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
        font-size: 0.8rem;
        margin-top: 3px;
    }

    .cp-recent {
        display: flex;
        gap: 5px;
    }
    .recent-swatch {
        width: 20px;
        height: 20px;
        border-radius: 50%; /* Legacy was round */
        border: 1px solid #444;
        cursor: pointer;
        transition: transform 0.1s;
    }
    .recent-swatch:hover {
        transform: scale(1.2);
        border-color: #fff;
    }
</style>
