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

    const HIGHLIGHT_PATTERNS =
        /\b(S[1-9]?\+?|SS[1-9]?\+?|SSS(?:-?[0-9]{1,2})?\+?)(?![a-zA-Z0-9\+])/g;
    const RANK_ONLY = /^(S[1-9]?\+?|SS[1-9]?\+?|SSS(?:-?[0-9]{1,2})?\+?)$/;

    const AFFIX_PATTERNS =
        /(?<![a-zA-Z0-9а-яА-ЯёЁ\+])(Ignition|Plasma|Slash|Umbra|Freez|Raydiance|Disruption|Физический|Огонь|Лед|Молния|Тьма|Нихил|Дезинтеграция|Горение|Плазма|Слеш|Тень|Заморозка|Рейдианс|Общий|\+15 АТК|Core Passive|Signature Move|Class Passive|Red Orb|Blue Orb|Yellow Orb|Glorious Afterglow|Glorious Spear|Honed Gel|Peaceful Radiant|Stellar Magnetic Rail|Superconducting Axial Ray|Absolute Defense|Boundaty's Annihilation|Domain Deconstuction|Gravity Barrier|Resonant Echo|Incandescence|Matrix Lightning|Nsec Transmission|Shock Echo|Shock Saturation|Dead Line Timing|Overload Signal)(?![a-zA-Z0-9а-яА-ЯёЁ\+])/gi;
    const AFFIX_ONLY =
        /^(Ignition|Plasma|Slash|Umbra|Freez|Raydiance|Disruption|Физический|Огонь|Лед|Молния|Тьма|Нихил|Дезинтеграция|Горение|Плазма|Слеш|Тень|Заморозка|Рейдианс|Общий|\+15 АТК|Core Passive|Signature Move|Class Passive|Red Orb|Blue Orb|Yellow Orb|Glorious Afterglow|Glorious Spear|Honed Gel|Peaceful Radiant|Stellar Magnetic Rail|Superconducting Axial Ray|Absolute Defense|Boundaty's Annihilation|Domain Deconstuction|Gravity Barrier|Resonant Echo|Incandescence|Matrix Lightning|Nsec Transmission|Shock Echo|Shock Saturation|Dead Line Timing|Overload Signal)$/i;

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

        // 1. Synchronous "Escape" from highlight
        // If caret is inside a highlight span and user types something non-matching (like '+'),
        // immediately unwrap to prevent flicker
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            let container = range.commonAncestorContainer;
            if (container.nodeType === 3) container = container.parentNode;

            if (container.classList) {
                const color = container.style.color
                    .toLowerCase()
                    .replace(/\s/g, "");
                const isOrange =
                    color === "rgb(255,153,0)" || color === "#ff9900";
                const isHighlight =
                    container.classList.contains("rank-highlight") ||
                    container.classList.contains("affix-highlight");

                if (isHighlight) {
                    const text = container.textContent;
                    const isRank =
                        container.classList.contains("rank-highlight");
                    const validator = isRank ? RANK_ONLY : AFFIX_ONLY;

                    if (!validator.test(text)) {
                        const pos = getCaretPosition(editor);
                        container.replaceWith(document.createTextNode(text));
                        editor.innerHTML = editor.innerHTML;
                        setCaretPosition(editor, pos);
                        value = editor.innerHTML;
                    }
                } else if (isOrange) {
                    // Sticky color detected on a non-highlight element
                    const pos = getCaretPosition(editor);
                    container.style.color = "";
                    if (!container.getAttribute("style"))
                        container.removeAttribute("style");
                    // If it was a font tag or empty span, autoHighlight will handle it,
                    // but we can try an immediate innerHTML refresh to kill the 'state'
                    editor.innerHTML = editor.innerHTML;
                    setCaretPosition(editor, pos);
                    value = editor.innerHTML;
                }
            }
        }

        // 2. Cleanup empty editor to prevent sticky styles
        if (
            editor.innerText.trim() === "" &&
            (editor.innerHTML.includes("<span") ||
                editor.innerHTML.includes("style="))
        ) {
            editor.innerHTML = "";
            editor.removeAttribute("style");
            value = "";
        }

        // 3. Debounce auto-highlighting
        clearTimeout(highlightTimer);
        highlightTimer = setTimeout(autoHighlight, 30);
    }

    let highlightTimer;
    function autoHighlight() {
        if (!editor) return;

        const temp = document.createElement("div");
        temp.innerHTML = editor.innerHTML;
        let changed = false;

        // 1. Cleanup sticky browser colors (including <font> tags and inline styles)
        const colorful = [
            ...temp.querySelectorAll('[style*="color"]'),
            ...temp.querySelectorAll("font[color]"),
        ];
        colorful.forEach((el) => {
            let color = "";
            if (el.tagName === "FONT") {
                color = el.getAttribute("color").toLowerCase();
            } else {
                color = el.style.color.toLowerCase().replace(/\s/g, "");
            }

            const isRankColor =
                color === "rgb(255,153,0)" || color === "#ff9900";
            const isAffixColor =
                color === "rgb(0,255,255)" ||
                color === "#00ffff" ||
                color === "rgb(0,255,153)" ||
                color === "#00ff99";

            if (
                !el.classList.contains("rank-highlight") &&
                !el.classList.contains("affix-highlight") &&
                (isRankColor || isAffixColor)
            ) {
                if (el.tagName === "FONT") {
                    // Replace <font> with its children
                    const text = el.textContent;
                    el.replaceWith(document.createTextNode(text));
                } else {
                    el.style.color = "";
                    if (!el.getAttribute("style")) el.removeAttribute("style");
                    // If it's a span with no other purpose, unwrap it
                    if (
                        el.tagName === "SPAN" &&
                        !el.className &&
                        !el.getAttribute("style")
                    ) {
                        el.replaceWith(...el.childNodes);
                    }
                }
                changed = true;
            }
        });

        // 2. Unwrap/Fix invalid highlights and purge empty ones
        const existing = [
            ...temp.querySelectorAll(".rank-highlight"),
            ...temp.querySelectorAll(".affix-highlight"),
        ];
        existing.forEach((span) => {
            const text = span.textContent;
            const isRank = span.classList.contains("rank-highlight");
            const validator = isRank ? RANK_ONLY : AFFIX_ONLY;

            // If empty or doesn't match the pattern fully anymore, unwrap
            if (!text || !validator.test(text)) {
                // If it's just empty, remove it completely
                if (!text) {
                    span.remove();
                } else {
                    span.replaceWith(document.createTextNode(text));
                }
                changed = true;
            }
        });

        // 3. Wrap new matches (Ranks first, then Affixes)
        const walk = (node) => {
            if (node.nodeType === 3) {
                const parent = node.parentNode;
                if (
                    parent &&
                    parent.classList &&
                    (parent.classList.contains("rank-highlight") ||
                        parent.classList.contains("affix-highlight"))
                )
                    return;

                const text = node.textContent;
                let html = text;
                let textChanged = false;

                // Highlight Ranks (Orange)
                HIGHLIGHT_PATTERNS.lastIndex = 0;
                if (HIGHLIGHT_PATTERNS.test(text)) {
                    html = html.replace(
                        HIGHLIGHT_PATTERNS,
                        '<span class="rank-highlight" style="color:#ff9900; font-weight:bold;">$1</span>',
                    );
                    textChanged = true;
                }

                // Highlight Affixes (Orange)
                AFFIX_PATTERNS.lastIndex = 0;
                if (AFFIX_PATTERNS.test(text)) {
                    // We use a temporary placeholder or careful replacement to avoid nested spans
                    // Since ranks and affixes are likely distinct strings, simple replace works if we haven't wrapped the whole node yet
                    html = html.replace(AFFIX_PATTERNS, (match) => {
                        // Check if this match is already inside a rank-highlight span we just created
                        // (not very likely in PGR context, but good practice)
                        return `<span class="affix-highlight" style="color:#ff9900; font-weight:bold;">${match}</span>`;
                    });
                    textChanged = true;
                }

                if (textChanged) {
                    const wrapper = document.createElement("span");
                    wrapper.innerHTML = html;
                    node.replaceWith(...wrapper.childNodes);
                    changed = true;
                }
            } else {
                [...node.childNodes].forEach(walk);
            }
        };
        walk(temp);

        if (changed) {
            const pos = getCaretPosition(editor);
            editor.innerHTML = temp.innerHTML;
            setCaretPosition(editor, pos);
            value = editor.innerHTML;
        }
    }

    function getCaretPosition(element) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return 0;
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        return preCaretRange.toString().length;
    }

    function setCaretPosition(element, pos) {
        const range = document.createRange();
        const sel = window.getSelection();
        let charCount = 0;
        const walk = (node) => {
            if (node.nodeType === 3) {
                const len = node.textContent.length;
                if (charCount + len >= pos) {
                    range.setStart(node, pos - charCount);
                    range.collapse(true);
                    return true;
                }
                charCount += len;
            } else {
                for (let child of node.childNodes) {
                    if (walk(child)) return true;
                }
            }
            return false;
        };
        walk(element);
        sel.removeAllRanges();
        sel.addRange(range);
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

    function initialContent(node) {
        if (value) node.innerHTML = value;
    }
</script>

<svelte:document
    onselectionchange={updateToolbarPos}
    onmousedown={(e) => {
        if (toolbar && !toolbar.contains(e.target)) {
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
        use:initialContent
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
    .rich-textarea {
        color: #ccc;
    }

    :global(.rich-textarea .rank-highlight) {
        color: #ff9900 !important;
        font-weight: bold;
    }

    :global(.rich-textarea .affix-highlight) {
        color: #ff9900 !important;
        font-weight: bold;
        text-shadow: 0 0 10px rgba(255, 153, 0, 0.3);
    }
</style>
