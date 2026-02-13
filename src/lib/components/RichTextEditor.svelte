<script>
    import { appState } from "$lib/state.svelte.js";
    import { onMount } from "svelte";
    import { t } from "$lib/i18n.js";

    let { value = $bindable("") } = $props();

    let editor = $state(null);
    let toolbar = $state(null);
    let showToolbar = $state(false);
    let toolbarPos = $state({ top: 0, left: 0 });
    let isBold = $state(false);
    let isItalic = $state(false);

    // Initial Content
    $effect(() => {
        if (editor && editor.innerHTML !== value) {
            if (value && editor.innerHTML === "") {
                editor.innerHTML = value;
            }
        }
    });

    function handleInput() {
        value = editor.innerHTML;
        updateToolbarState();
    }

    function updateToolbarState() {
        isBold = document.queryCommandState("bold");
        isItalic = document.queryCommandState("italic");
    }

    // let toolbarTimeout; // Removed

    // Portal Action to move element to body
    function portal(node) {
        document.body.appendChild(node);
        return {
            destroy() {
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            },
        };
    }

    function updateToolbarPos() {
        // If Custom Color picker is open, it takes precedence.
        // We assume the user is "working" on the color.
        if (activeDropdown === "customColor") {
            return;
        }

        // If user is interacting with the toolbar (inputs), do not hide or move
        if (
            activeDropdown &&
            toolbar &&
            document.activeElement &&
            toolbar.contains(document.activeElement)
        ) {
            return;
        }

        const selection = window.getSelection();

        // Hide if no selection or collapsed
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            if (activeDropdown === "customColor") return;
            showToolbar = false;
            activeDropdown = null;
            return;
        }

        const range = selection.getRangeAt(0);

        // Check if selection is inside editor
        let container = range.commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentNode;

        if (!editor.contains(container)) {
            if (activeDropdown === "customColor") return;
            showToolbar = false;
            activeDropdown = null;
            return;
        }

        // --- VALID SELECTION ---

        // Update savedRange to current selection to prevent "locking" to old selection
        savedRange = range;

        const rect = range.getBoundingClientRect();
        if (rect.width === 0) return;

        // Use VIEWPORT positioning (Fixed) since we are on Body
        // No need for container math
        const toolbarHeight = 50;
        const arrowHeight = 10;
        const toolbarHalfWidth = 170;

        let absCenter = rect.left + rect.width / 2;

        // Clamp Horizontal
        let screenWidth = window.innerWidth;
        let left = absCenter;
        let arrowOffset = 0;

        if (left - toolbarHalfWidth < 10) {
            let newLeft = toolbarHalfWidth + 10;
            arrowOffset = left - newLeft; // negative
            left = newLeft;
        } else if (left + toolbarHalfWidth > screenWidth - 10) {
            let newLeft = screenWidth - 10 - toolbarHalfWidth;
            arrowOffset = left - newLeft; // positive
            left = newLeft;
        }

        // Vertical Position
        let top = rect.top - toolbarHeight;
        let flipped = false;

        if (rect.top < 60) {
            flipped = true;
            top = rect.bottom + arrowHeight;
        }

        toolbarPos = { top, left, flipped, arrowOffset };
        showToolbar = true;
        updateToolbarState();
    }

    // execCmd moved to bottom to use restoreSelection

    function formatDoc(event, cmd, val) {
        if (event) event.preventDefault();
        // Save selection if not already saved (e.g. direct button click)
        const sel = window.getSelection();
        if (sel.rangeCount > 0) savedRange = sel.getRangeAt(0);

        execCmd(cmd, val);
    }

    function insertSeparator(event) {
        if (event) event.preventDefault();

        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const hr = document.createElement("div");
            hr.className = "separator-line";
            hr.contentEditable = "false";
            hr.style.display = "block";
            hr.style.width = "100%";
            hr.style.height = "1px";
            hr.style.background = "#333";
            hr.style.margin = "10px 0";

            const pAfter = document.createElement("div");
            pAfter.innerHTML = "<br>";

            range.deleteContents();
            range.insertNode(pAfter);
            range.insertNode(hr);

            // If at very start, add padding before
            if (editor.firstChild === hr) {
                const pBefore = document.createElement("div");
                pBefore.innerHTML = "<br>";
                editor.insertBefore(pBefore, hr);
            }

            range.setStart(pAfter, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);

            handleInput();
        }
        showToolbar = false;
    }

    import RichTextColorPicker from "./RichTextColorPicker.svelte";

    let savedRange = null;

    function saveSelection() {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            // Only save if the selection is inside the editor
            if (editor && editor.contains(range.commonAncestorContainer)) {
                savedRange = range;
            }
        }
    }

    function restoreSelection() {
        if (savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }
    }

    // Dropdown Toggles
    let activeDropdown = $state(null);
    // 'size', 'color'

    function toggleDropdown(name, event) {
        if (event) event.preventDefault();

        // If clicking same, close
        if (activeDropdown === name) {
            activeDropdown = null;
        } else {
            // Save selection before opening menu
            saveSelection();
            activeDropdown = name;
        }
    }

    function closeDropdowns() {
        activeDropdown = null;
    }

    function execCmd(cmd, val = null, keepFocus = false) {
        // Restore selection first!
        restoreSelection();

        document.execCommand("styleWithCSS", false, true);
        document.execCommand(cmd, false, val);

        // IMPORTANT: Update savedRange to the NEW selection left by execCommand
        // This ensures subsequent updates (like dragging slider) use the valid new DOM structure
        saveSelection();

        handleInput();

        // Refocus editor only if not requested to keep focus elsewhere (e.g. dragging slider)
        if (!keepFocus && editor) editor.focus();

        // Re-check state
        updateToolbarState();
    }

    // Color Picker Integration
    function applyColor(color, event) {
        if (event) event.preventDefault();
        execCmd("foreColor", color);
        // Do NOT close immediately if it's the custom picker, let user choose
        // But for swatches, close.
        if (event) activeDropdown = null;
    }

    function handleCustomColorApply(color) {
        // Use keepFocus=true to avoid stealing focus from the slider while dragging
        execCmd("foreColor", color, true);
        // Keep picker open
    }
</script>

<svelte:document
    onselectionchange={updateToolbarPos}
    onmousedown={(e) => {
        if (
            toolbar &&
            !toolbar.contains(e.target) &&
            !editor.contains(e.target)
        ) {
            if (activeDropdown && !e.target.closest(".rte-dropdown")) {
                closeDropdowns();
            }
        }
    }}
/>

<div class="rich-editor-container">
    <div
        class="rich-textarea"
        contenteditable="true"
        bind:this={editor}
        oninput={handleInput}
        role="textbox"
        tabindex="0"
        spellcheck="false"
        aria-label="Tactical analysis editor"
    ></div>

    {#if showToolbar}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            use:portal
            class="rte-toolbar visible {toolbarPos.flipped ? 'flipped' : ''}"
            bind:this={toolbar}
            style="top: {toolbarPos.top}px; left: {toolbarPos.left}px; --arrow-offset: {toolbarPos.arrowOffset}px; position: fixed;"
            onmousedown={(e) => e.preventDefault()}
            role="toolbar"
            aria-label="Text formatting tools"
            tabindex="-1"
        >
            <!-- Size Dropdown -->
            <div
                class="rte-dropdown {activeDropdown === 'size' ? 'active' : ''}"
            >
                <button
                    class="rte-btn"
                    onmousedown={(e) => toggleDropdown("size", e)}
                    aria-label="Font size"
                >
                    T <span style="font-size:8px; margin-left:2px;">▼</span>
                </button>
                {#if activeDropdown === "size"}
                    <div class="rte-dropdown-menu" role="menu" tabindex="-1">
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <div
                            class="rte-menu-item"
                            onmousedown={(e) => formatDoc(e, "fontSize", "1")}
                            role="menuitem"
                            tabindex="0"
                        >
                            {t("small")}
                        </div>
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <div
                            class="rte-menu-item"
                            onmousedown={(e) => formatDoc(e, "fontSize", "3")}
                            role="menuitem"
                            tabindex="0"
                        >
                            {t("medium")}
                        </div>
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <div
                            class="rte-menu-item"
                            onmousedown={(e) => formatDoc(e, "fontSize", "5")}
                            role="menuitem"
                            tabindex="0"
                        >
                            {t("large")}
                        </div>
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <div
                            class="rte-menu-item"
                            onmousedown={(e) => formatDoc(e, "fontSize", "7")}
                            role="menuitem"
                            tabindex="0"
                        >
                            {t("huge")}
                        </div>
                    </div>
                {/if}
            </div>

            <div
                style="width:1px; height:15px; background:#333; margin:0 2px;"
            ></div>

            <button
                class="rte-btn {isBold ? 'active' : ''}"
                onmousedown={(e) => formatDoc(e, "bold")}
                title={t("bold")}><b>B</b></button
            >
            <button
                class="rte-btn {isItalic ? 'active' : ''}"
                onmousedown={(e) => formatDoc(e, "italic")}
                title={t("italic")}><i>I</i></button
            >

            <div
                style="width:1px; height:15px; background:#333; margin:0 2px;"
            ></div>

            <!-- Alignment -->
            <button
                class="rte-btn"
                onmousedown={(e) => formatDoc(e, "justifyLeft")}
                title={t("align_left")}>≡←</button
            >
            <button
                class="rte-btn"
                onmousedown={(e) => formatDoc(e, "justifyCenter")}
                title={t("align_center")}>≡↔</button
            >

            <div
                style="width:1px; height:15px; background:#333; margin:0 2px;"
            ></div>

            <!-- Color Dropdown -->
            <div
                class="rte-dropdown {activeDropdown === 'color'
                    ? 'active'
                    : ''}"
            >
                <button
                    class="rte-btn"
                    onmousedown={(e) => toggleDropdown("color", e)}
                    aria-label="Text color"
                >
                    <span class="color-indicator"></span>
                    <span style="font-size:8px; margin-left:2px;">▼</span>
                </button>
                {#if activeDropdown === "color"}
                    {#if activeDropdown === "color"}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div
                            class="rte-dropdown-menu color-menu"
                            onclick={(e) => e.stopPropagation()}
                            role="menu"
                            tabindex="-1"
                        >
                            <!-- Preset Swatches -->
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <div
                                class="color-swatch"
                                style="background:#ff9900"
                                onmousedown={(e) => applyColor("#ff9900", e)}
                                role="menuitem"
                                tabindex="0"
                                aria-label="Orange"
                            ></div>
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <div
                                class="color-swatch"
                                style="background:#ea9999"
                                onmousedown={(e) => applyColor("#ea9999", e)}
                                role="menuitem"
                                tabindex="0"
                                aria-label="Light red"
                            ></div>
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <div
                                class="color-swatch"
                                style="background:#cc4125"
                                onmousedown={(e) => applyColor("#cc4125", e)}
                                role="menuitem"
                                tabindex="0"
                                aria-label="Red"
                            ></div>
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <div
                                class="color-swatch"
                                style="background:#6d9eeb"
                                onmousedown={(e) => applyColor("#6d9eeb", e)}
                                role="menuitem"
                                tabindex="0"
                                aria-label="Blue"
                            ></div>
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <div
                                class="color-swatch"
                                style="background:#ffffff"
                                onmousedown={(e) => applyColor("#ffffff", e)}
                                role="menuitem"
                                tabindex="0"
                                aria-label="White"
                            ></div>

                            <div class="color-separator"></div>

                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <div
                                class="color-swatch custom-picker-btn"
                                title={t("custom_color")}
                                onmousedown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleDropdown("customColor", e);
                                }}
                                role="menuitem"
                                tabindex="0"
                            ></div>
                        </div>
                    {/if}
                {/if}

                {#if activeDropdown === "customColor"}
                    <RichTextColorPicker
                        onapply={handleCustomColorApply}
                        onclose={() => {
                            activeDropdown = null;
                            if (editor) editor.focus();
                        }}
                    />
                {/if}
            </div>

            <div
                style="width:1px; height:15px; background:#333; margin:0 2px;"
            ></div>

            <button
                class="rte-btn"
                onmousedown={insertSeparator}
                title={t("separator")}>HR</button
            >
        </div>
    {/if}
</div>

<style>
    /* Most styles are global in app.css, but we can add component-specific ones here */
    .rte-toolbar {
        position: fixed;
        z-index: 10000;
        background: #1a1a1a;
        border: 1px solid #333;
        padding: 4px;
        gap: 4px;
        border-radius: 4px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;

        /* Only center horizontally. Vertical is handled by JS 'top' */
        transform: translateX(-50%);
        /* Start invisible to prevent jump artifacts */
        opacity: 0;
        animation: fadeIn 0.15s ease-out forwards;
        pointer-events: none; /* Prevent clicks while fading in/out */
    }

    .rte-toolbar.visible {
        /* opacity is handled by animation, but we keep this for state consistency */
        opacity: 1;
        pointer-events: auto;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    /* Flipped state only affects the arrow, not the main position (handled by JS) */
    /* .rte-toolbar.flipped {} - Removed empty rule */

    /* Default Arrow (Points Down, located at Bottom) */
    .rte-toolbar::after {
        content: "";
        position: absolute;
        top: 100%;
        left: calc(50% + var(--arrow-offset, 0px));
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #1a1a1a transparent transparent transparent;
    }

    /* Flipped Arrow (Points Up, located at Top) */
    .rte-toolbar.flipped::after {
        top: -10px;
        bottom: auto;
        border-color: transparent transparent #1a1a1a transparent;
    }

    .custom-picker-btn {
        background: conic-gradient(
            from 180deg at 50% 50%,
            #ff0000 0deg,
            #ffff00 60deg,
            #00ff00 120deg,
            #00ffff 180deg,
            #0000ff 240deg,
            #ff00ff 300deg,
            #ff0000 360deg
        );
        border-radius: 50%;
        border: 1px solid #555;
        overflow: hidden;
    }
</style>
