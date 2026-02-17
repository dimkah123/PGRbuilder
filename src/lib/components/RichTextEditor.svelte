<script>
    import { appState } from "$lib/state.svelte.js";
    import { onMount } from "svelte";
    import { t } from "$lib/i18n.js";
    import {
        CHAR_DATABASE,
        CHARACTER_IMAGES,
        ASSET_MAP,
        ELEMENT_NAMES,
        CLASS_NAMES,
        ELEMENT_IMAGES,
        CLASS_IMAGES,
        MEMORY_DATABASE,
        MEMORY_IMAGES,
    } from "$lib/data.js";

    let { value = $bindable("") } = $props();

    let editor = $state(null);
    let toolbar = $state(null);
    let showToolbar = $state(false);
    let toolbarPos = $state({ top: 0, left: 0 });
    let isBold = $state(false);
    let isItalic = $state(false);

    // Tooltip State
    let tooltip = $state({
        show: false,
        x: 0,
        y: 0,
        flipped: false,
        data: null,
        type: null,
    });
    let tooltipTimer;

    // Autocomplete State
    let acItems = $state([]);
    let acIndex = $state(0);
    let acPos = $state({ top: 0, left: 0 });
    let acVisible = $derived(acItems.length > 0);

    // Build autocomplete terms dynamically from databases + static keywords
    const STATIC_TERMS = [
        "Ignition",
        "Plasma",
        "Slash",
        "Umbra",
        "Freez",
        "Raydiance",
        "Disruption",
        "Физический",
        "Огонь",
        "Лед",
        "Молния",
        "Тьма",
        "Нихил",
        "Дезинтеграция",
        "Горение",
        "Плазма",
        "Слеш",
        "Тень",
        "Заморозка",
        "Рейдианс",
        "Общий",
        "Core Passive",
        "Signature Move",
        "Class Passive",
        "Red Orb",
        "Blue Orb",
        "Yellow Orb",
        "Glorious Afterglow",
        "Glorious Spear",
        "Honed Gel",
        "Peaceful Radiant",
        "Stellar Magnetic Rail",
        "Superconducting Axial Ray",
        "Absolute Defense",
        "Boundaty's Annihilation",
        "Domain Deconstuction",
        "Gravity Barrier",
        "Resonant Echo",
        "Incandescence",
        "Matrix Lightning",
        "Nsec Transmission",
        "Shock Echo",
        "Shock Saturation",
        "Dead Line Timing",
        "Overload Signal",
    ];

    // Count how many frames each character name has
    const enNameCount = {};
    const ruNameCount = {};
    for (const c of CHAR_DATABASE) {
        if (c.enName) enNameCount[c.enName] = (enNameCount[c.enName] || 0) + 1;
        if (c.name) ruNameCount[c.name] = (ruNameCount[c.name] || 0) + 1;
    }

    // Generate character terms: "Name: Frame" combos + bare names (only for single-frame chars)
    const charTerms = new Set();
    for (const c of CHAR_DATABASE) {
        // Bare frames are always useful
        if (c.enFrame) charTerms.add(c.enFrame);
        if (c.frame) charTerms.add(c.frame);
        // Combined "Name: Frame" variants (what players actually reference)
        if (c.enName && c.enFrame) charTerms.add(`${c.enName}: ${c.enFrame}`);
        if (c.name && c.frame) charTerms.add(`${c.name}: ${c.frame}`);
        // Only add bare name if character has exactly 1 frame
        if (c.enName && enNameCount[c.enName] === 1) charTerms.add(c.enName);
        if (c.name && ruNameCount[c.name] === 1) charTerms.add(c.name);
    }

    // Generate memory terms from database
    const memTerms = new Set();
    for (const m of MEMORY_DATABASE) {
        if (m.name) memTerms.add(m.name);
    }

    const AUTOCOMPLETE_TERMS = [...STATIC_TERMS, ...charTerms, ...memTerms];

    const HIGHLIGHT_PATTERNS =
        /(?<![a-zA-Z0-9а-яА-ЯёЁ\+])((?:S[1-9]?\+?|SS[1-9]?\+?|SSS(?:-?[0-9]{1,2})?\+?|Ignition|Plasma|Slash|Umbra|Freez|Raydiance|Disruption|Физический|Огонь|Лед|Молния|Тьма|Нихил|Дезинтеграция|Горение|Плазма|Слеш|Тень|Заморозка|Рейдианс|Общий|\+15 АТК|Core Passive|Signature Move|Class Passive|Red Orb|Blue Orb|Yellow Orb|Glorious Afterglow|Glorious Spear|Honed Gel|Peaceful Radiant|Stellar Magnetic Rail|Superconducting Axial Ray|Absolute Defense|Boundaty's Annihilation|Domain Deconstuction|Gravity Barrier|Resonant Echo|Incandescence|Matrix Lightning|Nsec Transmission|Shock Echo|Shock Saturation|Dead Line Timing|Overload Signal|Lucia|Liv|Nanami|Lee|Watanabe|Bianca|Karenina|Kamui|Ayla|Sophia|Chrome|Camu|Rosetta|Changyu|Qu|Luna|2B|9S|A2|Wanshi|Selena|21|Roland|Pulao|Haicma|Noan|Bambinata|Hanying|Noctis|Alisa|Lamia|Teddy|Bridget|Yata|Ishmael|Lilith|Jetavi|Dante|Vergil|Discord|Veronika|BLACK★ROCK SHOOTER|Люсия|Лив|Нанами|Ли|Ватанабэ|Бьянка|Каренина|Камуи|Айла|София|Хром|Каму|Розетта|Чангю|Цюй|Луна|Ваньши|Селена|Роланд|Пулао|Хайкма|Ноан|Бамбината|Ханьин|Ноктис|Алиса|Ламия|Тедди|Бриджит|Ята|Ишмаэль|Лилит|Джетави|Данте|Дискорд|Вероника|Aegis|Arca|Arete|Arclight|Ardeo|Astral|Bastion|Brilliance|Capriccio|Crepuscule|Crimson Abyss|Crimson Weave|Crocotta|Daemonissa|Dawn|Daybreak|Decryptor|Echo|Eclipse|Ember|Empyrea|Entropy|Epitaph|Feral|Flambeau|Fulgor|Garnet|Geiravor|Glory|Hyperreal|Hypnos|Indomitus|Kaleido|Laurel|Limpidity|Lost Lullaby|Lotus|Lucid Dreamer|Lux|Oblivion|Ornate Bell|Parhelion|Pavo|Pianissimo|Plume|Pulse|Pyropath|Qilin|Radiant Daybreak|Remote Star|Rigor|Rozen|Secator|Shukra|Silverfang|Solacetune|Spectre|Startrail|Stigmata|Storm|Tempest|Tenebrion|Veiled Star|Veritas|Vitrum|XXI|Zitherwoe|Dragontoll|Scire|Аегис|Арка|Арете|Арклайт|Ардео|Астрал|Бастион|Брилианс|Каприччио|Крепускул|Кримзон Абисс|Кримзон Вейв|Крокотта|Демонисса|Давн|Дейбрейкер|Декриптор|Эхо|Эклипс|Эмбер|Эмпирей|Энтропи|Эпитаф|Фламбеа|Фулгор|Гарнет|Гейравёр|Глори|Гиперреал|Гипнос|Индормитус|Калеидо|Лаурель|Лимпидити|Лост Лулаби|Лотус|Лусид Дример|Люкс|Обливион|Пархелион|Паво|Пианиссимо|Плюм|Пульс|Пироат|Цилинь|Ригор|Розен|Секатор|Шукра|Сильверфанг|Соласетюн|Спектр|Стартрейл|Стигмата|Шторм|Темпест|Тенебрион|Вейлед Стар|Веритас|Витрум|Зитервоу|Драгонтол|Скайр|Chang Wuzi|Chen Jiyuan|Da Vinci|Da Vinci|Ji Bo'an|Ji Boan|Philip II|Philip II|Aline|Alphonse|Barcelo|Bathlon|Boone|Bunsen|Burana|Catherine|Charlotte|Cleopatra|Condelina|Cottie|Darwin|Derketo|Diesel|Einsteina|Elizabeth|Flamel|Fran|Frederick|Guinevere|Hanna|Heisen|Heraclitus|Herschell|Hervor|Jeanne|Keats|Klenova|Leeuwenhoek|Liston|Natasha|Nimue|Patton|Poincare|Seraphine|Shakespeare|Signa|Sothoth|Tifa|Turing|Unimate|Wilde):?)(?![a-zA-Z0-9а-яА-ЯёЁ\+])/gi;
    const HIGHLIGHT_ONLY =
        /^(S[1-9]?\+?|SS[1-9]?\+?|SSS(?:-?[0-9]{1,2})?\+?|Ignition|Plasma|Slash|Umbra|Freez|Raydiance|Disruption|Физический|Огонь|Лед|Молния|Тьма|Нихил|Дезинтеграция|Горение|Плазма|Слеш|Тень|Заморозка|Рейдианс|Общий|\+15 АТК|Core Passive|Signature Move|Class Passive|Red Orb|Blue Orb|Yellow Orb|Glorious Afterglow|Glorious Spear|Honed Gel|Peaceful Radiant|Stellar Magnetic Rail|Superconducting Axial Ray|Absolute Defense|Boundaty's Annihilation|Domain Deconstuction|Gravity Barrier|Resonant Echo|Incandescence|Matrix Lightning|Nsec Transmission|Shock Echo|Shock Saturation|Dead Line Timing|Overload Signal|Lucia|Liv|Nanami|Lee|Watanabe|Bianca|Karenina|Kamui|Ayla|Sophia|Chrome|Camu|Rosetta|Changyu|Qu|Luna|2B|9S|A2|Wanshi|Selena|21|Roland|Pulao|Haicma|Noan|Bambinata|Hanying|Noctis|Alisa|Lamia|Teddy|Bridget|Yata|Ishmael|Lilith|Jetavi|Dante|Vergil|Discord|Veronika|BLACK★ROCK SHOOTER|Люсия|Лив|Нанами|Ли|Ватанабэ|Бьянка|Каренина|Камуи|Айла|София|Хром|Каму|Розетта|Чангю|Цюй|Луна|Ваньши|Селена|Роланд|Пулао|Хайкма|Ноан|Бамбината|Ханьин|Ноктис|Алиса|Ламия|Тедди|Бриджит|Ята|Ишмаэль|Лилит|Джетави|Данте|Дискорд|Вероника|Aegis|Arca|Arete|Arclight|Ardeo|Astral|Bastion|Brilliance|Capriccio|Crepuscule|Crimson Abyss|Crimson Weave|Crocotta|Daemonissa|Dawn|Daybreak|Decryptor|Echo|Eclipse|Ember|Empyrea|Entropy|Epitaph|Feral|Flambeau|Fulgor|Garnet|Geiravor|Glory|Hyperreal|Hypnos|Indomitus|Kaleido|Laurel|Limpidity|Lost Lullaby|Lotus|Lucid Dreamer|Lux|Oblivion|Ornate Bell|Parhelion|Pavo|Pianissimo|Plume|Pulse|Pyropath|Qilin|Radiant Daybreak|Remote Star|Rigor|Rozen|Secator|Shukra|Silverfang|Solacetune|Spectre|Startrail|Stigmata|Storm|Tempest|Tenebrion|Veiled Star|Veritas|Vitrum|XXI|Zitherwoe|Dragontoll|Scire|Аегис|Арка|Арете|Арклайт|Ардео|Астрал|Бастион|Брилианс|Каприччио|Крепускул|Кримзон Абисс|Кримзон Вейв|Крокотта|Демонисса|Давн|Дейбрейкер|Декриптор|Эхо|Эклипс|Эмбер|Эмпирей|Энтропи|Эпитаф|Фламбеа|Фулгор|Гарнет|Гейравёр|Глори|Гиперреал|Гипнос|Индормитус|Калеидо|Лаурель|Лимпидити|Лост Лулаби|Лотус|Лусид Дример|Люкс|Обливион|Пархелион|Паво|Пианиссимо|Плюм|Пульс|Пироат|Цилинь|Ригор|Розен|Секатор|Шукра|Сильверфанг|Соласетюн|Спектр|Стартрейл|Стигмата|Шторм|Темпест|Тенебрион|Вейлед Стар|Веритас|Витрум|Зитервоу|Драгонтол|Скайр|Chang Wuzi|Chen Jiyuan|Da Vinci|Da Vinci|Ji Bo'an|Ji Boan|Philip II|Philip II|Aline|Alphonse|Barcelo|Bathlon|Boone|Bunsen|Burana|Catherine|Charlotte|Cleopatra|Condelina|Cottie|Darwin|Derketo|Diesel|Einsteina|Elizabeth|Flamel|Fran|Frederick|Guinevere|Hanna|Heisen|Heraclitus|Herschell|Hervor|Jeanne|Keats|Klenova|Leeuwenhoek|Liston|Natasha|Nimue|Patton|Poincare|Seraphine|Shakespeare|Signa|Sothoth|Tifa|Turing|Unimate|Wilde):?$/i;

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

                    if (!HIGHLIGHT_ONLY.test(text)) {
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

        // 4. Autocomplete
        updateAutocomplete();
    }

    function getCurrentWord() {
        const sel = window.getSelection();
        if (!sel.rangeCount) return null;
        const range = sel.getRangeAt(0);
        let node = range.startContainer;
        if (node.nodeType !== 3) return null;
        const text = node.textContent;
        const offset = range.startOffset;
        // Walk backwards to find word start
        let start = offset;
        while (start > 0 && !/\s/.test(text[start - 1])) start--;
        const word = text.substring(start, offset);
        if (word.length < 2) return null;
        return { word, node, start, end: offset };
    }

    function updateAutocomplete() {
        const current = getCurrentWord();
        if (!current) {
            acItems = [];
            return;
        }
        const q = current.word.toLowerCase();
        const matches = AUTOCOMPLETE_TERMS.filter(
            (t) => t.toLowerCase().startsWith(q) && t.toLowerCase() !== q,
        )
            // Prioritize combined "Name: Frame" terms over bare names
            .sort((a, b) => {
                const aHasColon = a.includes(": ");
                const bHasColon = b.includes(": ");
                if (aHasColon && !bHasColon) return -1;
                if (!aHasColon && bHasColon) return 1;
                return a.localeCompare(b);
            })
            .slice(0, 12);
        if (matches.length === 0) {
            acItems = [];
            return;
        }
        // Get caret position for dropdown
        const sel = window.getSelection();
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        acPos = { top: rect.bottom + 4, left: rect.left };
        acIndex = 0;
        acItems = matches;
    }

    function selectAutocomplete(term) {
        const current = getCurrentWord();
        if (!current) return;
        const { node, start, end } = current;
        const text = node.textContent;
        node.textContent =
            text.substring(0, start) + term + " " + text.substring(end);
        // Place caret after inserted term + space
        const sel = window.getSelection();
        const newRange = document.createRange();
        newRange.setStart(node, start + term.length + 1);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
        acItems = [];
        value = editor.innerHTML;
        clearTimeout(highlightTimer);
        highlightTimer = setTimeout(autoHighlight, 30);
    }

    function handleEditorKeydown(e) {
        if (acVisible) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                acIndex = (acIndex + 1) % acItems.length;
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                acIndex = (acIndex - 1 + acItems.length) % acItems.length;
                return;
            }
            if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                selectAutocomplete(acItems[acIndex]);
                return;
            }
            if (e.key === "Escape") {
                e.preventDefault();
                acItems = [];
                return;
            }
        }
    }

    let isMouseDown = false;

    function handleMouseOver(e) {
        const target =
            e.target.closest(".char-highlight") ||
            e.target.closest(".memory-highlight");
        if (target) {
            clearTimeout(tooltipTimer);

            // Suppress tooltips while selecting text (mouse drag or existing selection)
            if (isMouseDown) {
                tooltip.show = false;
                return;
            }
            const selection = window.getSelection();
            if (selection && selection.toString().trim().length > 0) {
                tooltip.show = false;
                return;
            }

            const text = (
                target.textContent.endsWith(":")
                    ? target.textContent.slice(0, -1)
                    : target.textContent
            ).trim();

            const isMemoryEl = target.classList.contains("memory-highlight");

            if (isMemoryEl) {
                const memory = MEMORY_DATABASE.find(
                    (m) => m.name.toLowerCase() === text.toLowerCase(),
                );
                if (memory) {
                    const rect = target.getBoundingClientRect();
                    const newX = rect.left + rect.width / 2;
                    const fitsAbove = rect.top > 200;
                    const newY = fitsAbove ? rect.top - 15 : rect.bottom + 15;
                    if (
                        !tooltip.show ||
                        tooltip.data !== memory ||
                        Math.abs(tooltip.x - newX) > 5
                    ) {
                        tooltip = {
                            show: true,
                            x: newX,
                            y: newY,
                            flipped: !fitsAbove,
                            data: memory,
                            type: "memory",
                        };
                    }
                }
            } else {
                const char = CHAR_DATABASE.find(
                    (c) =>
                        (c.name &&
                            c.name.toLowerCase() === text.toLowerCase()) ||
                        (c.enName &&
                            c.enName.toLowerCase() === text.toLowerCase()) ||
                        (c.frame &&
                            c.frame.toLowerCase() === text.toLowerCase()) ||
                        (c.enFrame &&
                            c.enFrame.toLowerCase() === text.toLowerCase()),
                );
                // Skip tooltip for bare multi-frame character names
                const isBareName =
                    char &&
                    ((char.name &&
                        char.name.toLowerCase() === text.toLowerCase()) ||
                        (char.enName &&
                            char.enName.toLowerCase() === text.toLowerCase()));
                const isMultiFrame =
                    isBareName &&
                    ((char.enName && enNameCount[char.enName] > 1) ||
                        (char.name && ruNameCount[char.name] > 1));
                if (char && !isMultiFrame) {
                    const rect = target.getBoundingClientRect();
                    const newX = rect.left + rect.width / 2;
                    const fitsAbove = rect.top > 200;
                    const newY = fitsAbove ? rect.top - 15 : rect.bottom + 15;
                    if (
                        !tooltip.show ||
                        tooltip.data !== char ||
                        Math.abs(tooltip.x - newX) > 5
                    ) {
                        tooltip = {
                            show: true,
                            x: newX,
                            y: newY,
                            flipped: !fitsAbove,
                            data: char,
                            type: "char",
                        };
                    }
                }
            }
        }
    }

    function handleMouseOut(e) {
        // Only trigger hide if moving to something that isn't a highlight
        const to = e.relatedTarget;
        if (
            to &&
            to.closest &&
            (to.closest(".char-highlight") || to.closest(".memory-highlight"))
        ) {
            return;
        }

        clearTimeout(tooltipTimer);
        tooltipTimer = setTimeout(() => {
            tooltip.show = false;
        }, 150); // Slightly longer delay for stability
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

            const isOrange = color === "rgb(255,153,0)" || color === "#ff9900";

            if (
                !el.classList.contains("rank-highlight") &&
                !el.classList.contains("affix-highlight") &&
                isOrange
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

            // If empty or doesn't match the pattern fully anymore, unwrap
            if (!text || !HIGHLIGHT_ONLY.test(text)) {
                // If it's just empty, remove it completely
                if (!text) {
                    span.remove();
                } else {
                    span.replaceWith(document.createTextNode(text));
                }
                changed = true;
            }
        });

        // 3. Wrap new matches (Now consolidated)
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
                HIGHLIGHT_PATTERNS.lastIndex = 0;
                const wrapper = document.createElement("span");
                wrapper.innerHTML = text.replace(
                    HIGHLIGHT_PATTERNS,
                    (match) => {
                        const cleanMatch = match.endsWith(":")
                            ? match.slice(0, -1)
                            : match;
                        const isChar = CHAR_DATABASE.some(
                            (c) =>
                                (c.name &&
                                    c.name.toLowerCase() ===
                                        cleanMatch.toLowerCase()) ||
                                (c.enName &&
                                    c.enName.toLowerCase() ===
                                        cleanMatch.toLowerCase()) ||
                                (c.frame &&
                                    c.frame.toLowerCase() ===
                                        cleanMatch.toLowerCase()) ||
                                (c.enFrame &&
                                    c.enFrame.toLowerCase() ===
                                        cleanMatch.toLowerCase()),
                        );
                        const isMemory =
                            !isChar &&
                            MEMORY_DATABASE.some(
                                (m) =>
                                    m.name.toLowerCase() ===
                                    cleanMatch.toLowerCase(),
                            );
                        const extraClass = isChar
                            ? " char-highlight"
                            : isMemory
                              ? " memory-highlight"
                              : "";
                        return `<span class="rank-highlight${extraClass}" style="color:#ff9900; font-weight:bold;">${match}</span>`;
                    },
                );
                node.replaceWith(...wrapper.childNodes);
                changed = true;
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
            hr.style.margin = "3px 0";

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

<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<div
    class="rich-editor-wrapper"
    onmouseover={handleMouseOver}
    onmouseout={handleMouseOut}
    onmousedown={() => {
        isMouseDown = true;
        tooltip.show = false;
    }}
    onmouseup={() => {
        isMouseDown = false;
    }}
    role="presentation"
>
    <div
        class="rich-textarea"
        contenteditable="true"
        bind:this={editor}
        use:initialContent
        oninput={handleInput}
        onkeydown={handleEditorKeydown}
        role="textbox"
        tabindex="0"
        spellcheck="false"
        aria-label="Tactical analysis editor"
    ></div>

    {#if acVisible}
        <div
            class="ac-dropdown"
            style="top: {acPos.top}px; left: {acPos.left}px; position: fixed;"
        >
            {#each acItems as item, i}
                <div
                    class="ac-item"
                    class:active={i === acIndex}
                    onmousedown={(e) => {
                        e.preventDefault();
                        selectAutocomplete(item);
                    }}
                    role="option"
                    tabindex="-1"
                    aria-selected={i === acIndex}
                >
                    {item}
                </div>
            {/each}
        </div>
    {/if}

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

    {#if tooltip.show && tooltip.data}
        {#if tooltip.type === "char"}
            {@const elementKey = Object.keys(ELEMENT_NAMES.en).find(
                (k) =>
                    ELEMENT_NAMES.en[k] === tooltip.data.element ||
                    ELEMENT_NAMES.ru[k] === tooltip.data.element,
            )}
            {@const classKey = Object.keys(CLASS_NAMES.en).find(
                (k) =>
                    CLASS_NAMES.en[k] === tooltip.data.class ||
                    CLASS_NAMES.ru[k] === tooltip.data.class,
            )}
            {@const affixKey = tooltip.data.affix
                ? Object.keys(ELEMENT_NAMES.en).find(
                      (k) =>
                          ELEMENT_NAMES.en[k] === tooltip.data.affix ||
                          ELEMENT_NAMES.ru[k] === tooltip.data.affix,
                  )
                : null}
            <div
                use:portal
                class="char-tooltip {tooltip.flipped ? 'flipped' : ''}"
                style="top: {tooltip.y}px; left: {tooltip.x}px; position: fixed;"
            >
                <div class="tooltip-inner">
                    <div class="tooltip-portrait">
                        <img
                            src={ASSET_MAP[
                                tooltip.data.enFrame?.toLowerCase() ||
                                    tooltip.data.frame?.toLowerCase()
                            ]}
                            alt={tooltip.data.name}
                        />
                    </div>
                    <div class="tooltip-info">
                        <div class="tooltip-header">
                            <div class="tooltip-name-row">
                                <div class="tooltip-name">
                                    {appState.lang === "en"
                                        ? tooltip.data.enName ||
                                          tooltip.data.name
                                        : tooltip.data.name}
                                </div>
                                {#if tooltip.data.rank}
                                    <div class="rank-badge-header">
                                        {tooltip.data.rank}
                                    </div>
                                {/if}
                            </div>
                            <div class="tooltip-frame">
                                {appState.lang === "en"
                                    ? tooltip.data.enFrame || tooltip.data.frame
                                    : tooltip.data.frame}
                            </div>
                        </div>

                        <div class="tooltip-rows">
                            <!-- Row 1: Element + Rank -->
                            <div class="tooltip-row">
                                <div class="tooltip-stat">
                                    <img
                                        src={ELEMENT_IMAGES[elementKey]}
                                        alt="element"
                                        class="stat-icon"
                                    />
                                    <span
                                        >{ELEMENT_NAMES[appState.lang][
                                            elementKey
                                        ] || tooltip.data.element}</span
                                    >
                                </div>
                            </div>

                            <!-- Row 2: Affix (if any) -->
                            {#if tooltip.data.affix}
                                <div class="tooltip-row">
                                    <div class="tooltip-stat">
                                        <img
                                            src={ELEMENT_IMAGES[affixKey]}
                                            alt="affix"
                                            class="stat-icon"
                                        />
                                        <span
                                            >{ELEMENT_NAMES[appState.lang][
                                                affixKey
                                            ] || tooltip.data.affix}</span
                                        >
                                    </div>
                                </div>
                            {/if}

                            <!-- Row 3: Class -->
                            <div class="tooltip-row">
                                <div class="tooltip-stat">
                                    <img
                                        src={CLASS_IMAGES[classKey]}
                                        alt="class"
                                        class="stat-icon"
                                    />
                                    <span
                                        >{CLASS_NAMES[appState.lang][
                                            classKey
                                        ] || tooltip.data.class}</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {:else if tooltip.type === "memory"}
            <div
                use:portal
                class="char-tooltip {tooltip.flipped ? 'flipped' : ''}"
                style="top: {tooltip.y}px; left: {tooltip.x}px; position: fixed;"
            >
                <div class="memory-tooltip-inner">
                    <div class="memory-tooltip-left">
                        <div class="memory-tooltip-name">
                            {tooltip.data.name}
                        </div>
                        <div class="memory-portrait">
                            <img
                                src={MEMORY_IMAGES[
                                    tooltip.data.name.toLowerCase()
                                ]}
                                alt={tooltip.data.name}
                            />
                        </div>
                        <div class="memory-stats">
                            <span class="memory-stat"
                                >HP <b>{tooltip.data.hp}</b></span
                            >
                            <span class="memory-stat"
                                >CRIT <b>{tooltip.data.crit}</b></span
                            >
                            <span class="memory-stat"
                                >ATK <b>{tooltip.data.atk}</b></span
                            >
                            <span class="memory-stat"
                                >DEF <b>{tooltip.data.def}</b></span
                            >
                        </div>
                    </div>
                    {#if tooltip.data.effects.twoPiece[appState.lang] || tooltip.data.effects.fourPiece[appState.lang]}
                        <div class="memory-tooltip-right">
                            {#if tooltip.data.effects.twoPiece[appState.lang]}
                                <div class="memory-effect">
                                    <div class="memory-effect-label">2-Set</div>
                                    <div class="memory-effect-text">
                                        {tooltip.data.effects.twoPiece[
                                            appState.lang
                                        ]}
                                    </div>
                                </div>
                            {/if}
                            {#if tooltip.data.effects.fourPiece[appState.lang]}
                                <div class="memory-effect">
                                    <div class="memory-effect-label">4-Set</div>
                                    <div class="memory-effect-text">
                                        {tooltip.data.effects.fourPiece[
                                            appState.lang
                                        ]}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
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

    .rich-editor-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    /* Tooltip styling */
    .char-tooltip {
        position: fixed;
        transform: translate(-50%, -100%);
        z-index: 10000;
        pointer-events: none;
        animation: tooltipAppear 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    }

    .char-tooltip.flipped {
        transform: translate(-50%, 0%);
        animation: tooltipAppearFlipped 0.2s
            cubic-bezier(0.18, 0.89, 0.32, 1.28);
    }
    @keyframes tooltipAppear {
        from {
            opacity: 0;
            transform: translate(-50%, -90%) scale(0.9);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1);
        }
    }

    @keyframes tooltipAppearFlipped {
        from {
            opacity: 0;
            transform: translate(-50%, 10%) scale(0.9);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0%) scale(1);
        }
    }

    .tooltip-inner {
        background: rgba(10, 10, 15, 0.98);
        border: 1px solid var(--accent-red);
        border-radius: 4px;
        padding: 6px; /* Reduced padding */
        display: flex;
        gap: 12px;
        box-shadow:
            0 15px 45px rgba(0, 0, 0, 0.9),
            0 0 30px rgba(255, 60, 60, 0.2);
        backdrop-filter: blur(12px);
        min-width: unset; /* Remove min-width to avoid empty space */
        max-width: 320px;
    }

    .tooltip-portrait {
        width: 100px; /* Increased size */
        height: 135px; /* Increased size for vertical coverage */
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: transparent;
        overflow: hidden;
        flex-shrink: 0;
    }

    .tooltip-portrait img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .tooltip-info {
        display: flex;
        flex-direction: column;
        justify-content: flex-start; /* Align content to top */
        flex: 1;
        padding: 4px 6px 4px 0;
    }

    .tooltip-header {
        margin-bottom: 8px;
    }

    .tooltip-name-row {
        display: flex;
        align-items: baseline;
        gap: 8px;
        flex-wrap: wrap; /* Handle long names */
    }

    .tooltip-name {
        color: #fff;
        font-size: 1.25rem;
        font-weight: bold;
        line-height: 1.1;
    }

    .rank-badge-header {
        background: rgba(255, 60, 60, 0.15);
        border: 1px solid rgba(255, 60, 60, 0.4);
        color: var(--accent-red);
        font-weight: 900;
        font-size: 0.75rem;
        padding: 0px 5px;
        border-radius: 2px;
        text-shadow: 0 0 8px rgba(255, 60, 60, 0.4);
        transform: translateY(-1px);
    }

    .tooltip-frame {
        color: var(--accent-red);
        font-size: 0.85rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.9;
    }

    .tooltip-rows {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-top: auto; /* Push stats to bottom for balance */
    }

    .tooltip-row {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 6px;
    }

    .tooltip-stat {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.03);
        padding: 2px 6px;
        border-radius: 2px;
        font-size: 0.95rem;
        color: #ddd;
    }

    .stat-icon {
        width: 18px;
        height: 18px;
    }

    :global(.char-highlight) {
        cursor: help;
    }

    :global(.memory-highlight) {
        cursor: help;
    }

    .memory-tooltip-inner {
        background: rgba(10, 10, 15, 0.98);
        border: 1px solid var(--accent-red);
        border-radius: 4px;
        padding: 8px;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 10px;
        box-shadow:
            0 15px 45px rgba(0, 0, 0, 0.9),
            0 0 30px rgba(255, 60, 60, 0.2);
        backdrop-filter: blur(12px);
        max-width: 520px;
    }

    .memory-tooltip-left {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
    }

    .memory-tooltip-right {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
        min-width: 0;
        border-left: 1px solid rgba(255, 255, 255, 0.08);
        padding-left: 10px;
    }

    .memory-tooltip-name {
        color: #fff;
        font-size: 1.1rem;
        font-weight: bold;
        text-align: center;
        line-height: 1.1;
    }

    .memory-portrait {
        width: 72px;
        height: 72px;
        border-radius: 4px;
        overflow: hidden;
        flex-shrink: 0;
    }

    .memory-portrait img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .memory-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2px 12px;
    }

    .memory-stat {
        color: #999;
        font-size: 0.75rem;
        letter-spacing: 0.3px;
    }

    .memory-stat b {
        color: #eee;
        font-weight: bold;
        margin-left: 4px;
    }

    .memory-effect-label {
        color: var(--accent-red);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 2px;
    }

    .memory-effect-text {
        color: #bbb;
        font-size: 0.8rem;
        line-height: 1.35;
        text-align: left;
    }

    /* Autocomplete dropdown */
    .ac-dropdown {
        z-index: 10001;
        background: rgba(15, 15, 20, 0.98);
        border: 1px solid var(--accent-red);
        border-radius: 4px;
        min-width: 180px;
        max-width: 320px;
        max-height: 260px;
        overflow-y: auto;
        box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.8),
            0 0 15px rgba(255, 60, 60, 0.15);
        backdrop-filter: blur(10px);
        animation: acFadeIn 0.12s ease-out;
    }
    @keyframes acFadeIn {
        from {
            opacity: 0;
            transform: translateY(-4px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .ac-item {
        padding: 6px 12px;
        font-size: 0.8rem;
        color: #ccc;
        cursor: pointer;
        font-family: var(--font-tech);
        white-space: nowrap;
        transition:
            background 0.1s,
            color 0.1s;
    }
    .ac-item:hover,
    .ac-item.active {
        background: rgba(255, 60, 60, 0.15);
        color: #fff;
    }
    .ac-item.active {
        border-left: 2px solid var(--accent-red);
    }
</style>
