<script>
    import { onMount } from "svelte";
    import { appState } from "$lib/state.svelte.js";
    import { t } from "$lib/i18n.js";
    import { CHAR_DATABASE, CHARACTER_IMAGES } from "$lib/data.js";

    let roster = $state([]);
    let showFilters = $state(false);
    let filterRank = $state("ALL");
    let filterElement = $state("ALL");
    let filterClass = $state("ALL");
    let filterAffix = $state("ALL");

    let filteredRoster = $derived(
        roster.filter((char) => {
            if (filterRank !== "ALL" && char.rank !== filterRank) return false;
            if (filterAffix !== "ALL" && char.affix !== filterAffix)
                return false;

            if (filterElement !== "ALL") {
                const elMap = {
                    Physical: "Физический",
                    Fire: "Огонь",
                    Ice: "Лед",
                    Lightning: "Молния",
                    Dark: "Тьма",
                    Void: "Нихил",
                };
                if (char.element !== elMap[filterElement]) return false;
            }

            if (filterClass !== "ALL") {
                const clMap = {
                    Attacker: "Атакующий",
                    Tank: "Танк",
                    Support: "Поддержка",
                    Vanguard: "Авангард",
                    Amplifier: "Амплифаер",
                    Observer: "Наблюдатель",
                    Breaker: "Брейкер",
                };
                if (char.class !== clMap[filterClass]) return false;
            }

            return true;
        }),
    );

    // The user's requested display order
    const desiredOrder = [
        "Lucia: Lotus",
        "Liv: Eclipse",
        "Nanami: Storm",
        "Lucia: Dawn",
        "Liv: Lux",
        "Lee: Palefire",
        "Watanabe: Nightblade",
        "Bianca: Zero",
        "Karenina: Blast",
        "Liv: Luminance",
        "Lee: Entropy",
        "Karenina: Ember",
        "Nanami: Pulse",
        "Kamui: Tenebrion",
        "Lucia: Crimson Abyss",
        "Kamui: Bastion",
        "Watanabe: Astral",
        "Ayla: Brilliance",
        "Bianca: Veritas",
        "Sophia: Silverfang",
        "Chrome: Arclight",
        "Lucia: Plume",
        "Vera: Rozen",
        "Camu: Crocotta",
        "Rosetta: Rigor",
        "Changyu: Qilin",
        "Qu: Pavo",
        "Luna: Laurel",
        "2B",
        "9S",
        "A2",
        "Wanshi: Hypnos",
        "Selena: Tempest",
        "Chrome: Glory",
        "No.21: XXI",
        "Vera: Garnet",
        "Roland: Flambeau",
        "Liv: Empyrea",
        "Selena: Capriccio",
        "Pulao: Dragontoll",
        "Nanami: Starfarer",
        "Haicma: Starveil",
        "Karenina: Scire",
        "Noan: Arca",
        "Bianca: Stigmata",
        "Bambinata: Vitrum",
        "Lee: Hyperreal",
        "Ayla: Kaleido",
        "Lucia: Crimson Weave",
        "Hanying: Zitherwoe",
        "No.21: Feral Scent",
        "Noctis: Indomitus",
        "Alisa: Echo",
        "Lamia: Lost Lullaby",
        "BLACK★ROCK SHOOTER",
        "Watanabe: Epitaph",
        "Qu: Shukra",
        "Teddy: Decryptor",
        "Luna: Oblivion",
        "Bridget: Ardeo",
        "Hanying: Solacetune",
        "Wanshi: Lucid Dreamer",
        "Lucia: Pyroath",
        "Yata: Fulgor",
        "Nanami: Startrail",
        "Ishmael: Parhelion",
        "Lilith: Daemonissa",
        "Selena: Pianissimo",
        "Jetavie: Daybreak",
        "Vera: Geiravor",
        "Dante",
        "Vergil",
        "Bianca: Crepuscule",
        "Discord: Secator",
        "Veronica: Aegis",
        "Liv: Limpidity",
        "Teddy: Spectre",
        "Rosetta: Arete",
    ];

    onMount(() => {
        // Load real characters from CHAR_DATABASE
        const rawRoster = CHAR_DATABASE.map((char, index) => {
            const imageInfo = CHARACTER_IMAGES.find(
                (img) => img.frame === char.enFrame,
            );
            return {
                id: index,
                name: char.name, // RU name
                enName: char.enName, // EN name
                frame: char.frame, // RU frame name
                enFrame: char.enFrame, // EN frame name
                rank: char.rank,
                class: char.class,
                element: char.element,
                affix: char.affix || null,
                avatar: imageInfo ? `/${imageInfo.file}` : "",
            };
        });

        // Helper to generate a matching string for sorting
        const getSortKey = (char) => {
            let name = char.enName;
            let frame = char.enFrame;

            // Normalize names to match the custom order list
            if (name === "21") name = "No.21";
            if (name === "Jetavi") name = "Jetavie";
            if (name === "Veronika") name = "Veronica";

            // Normalize frames
            if (name === "Haicma" && frame === "Veiled Star")
                frame = "Starveil";
            if (name === "No.21" && frame === "Feral") frame = "Feral Scent";
            if (name === "Nanami" && frame === "Starfarer") frame = "Startrail";

            // For single-name chars (collabs)
            if (!frame || frame === name) return name;
            return `${name}: ${frame}`;
        };

        // Sort based on the desired order
        roster = rawRoster.sort((a, b) => {
            const aKey = getSortKey(a);
            const bKey = getSortKey(b);
            let aIndex = desiredOrder.indexOf(aKey);
            let bIndex = desiredOrder.indexOf(bKey);

            // If character is not in the list, push it to the end
            if (aIndex === -1) aIndex = 9999;
            if (bIndex === -1) bIndex = 9999;

            return aIndex - bIndex;
        });

        // This page doesn't use the complex builder initialization, so we manually hide the loader
        appState.isLoading = false;
    });
</script>

<svelte:head>
    <title>GRAY RAVEN DB // ГЛАВНАЯ</title>
</svelte:head>

<div class="layout-wrapper">
    <aside class="sidebar">
        <!-- eslint-disable-next-line a11y-invalid-attribute -->
        <button class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24">
                <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
            </svg>
            <span class="nav-text">{t("nav_constructs")}</span>
        </button>
        <a href="/" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24">
                <path
                    d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"
                />
            </svg>
            <span class="nav-text">{t("nav_builds")}</span>
        </a>
        <!-- eslint-disable-next-line a11y-invalid-attribute -->
        <button class="nav-item" style="margin-top: auto;">
            <svg class="nav-icon" viewBox="0 0 24 24">
                <path
                    d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"
                />
            </svg>
            <span class="nav-text">{t("nav_settings")}</span>
        </button>
    </aside>

    <main class="main-content">
        <header class="header">
            <div class="logo-text">
                {#if appState.lang === "ru"}
                    <span>GRAY RAVEN DB</span> // СПИСОК КОНСТРУКТОВ
                {:else}
                    <span>GRAY RAVEN DB</span> // CONSTRUCT ROSTER
                {/if}
            </div>
            <div class="header-controls">
                <div style="position: relative;">
                    <button
                        class="btn btn-filter {showFilters ? 'active' : ''}"
                        onclick={() => (showFilters = !showFilters)}
                    >
                        {t("filters")}
                    </button>

                    {#if showFilters}
                        <div class="filter-panel">
                            <div class="filter-group">
                                <span class="filter-label">Rank</span>
                                <button
                                    class="filter-opt {filterRank === 'ALL'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterRank = "ALL")}
                                    >All</button
                                >
                                <button
                                    class="filter-opt {filterRank === 'S'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterRank = "S")}>S</button
                                >
                                <button
                                    class="filter-opt {filterRank === 'A'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterRank = "A")}>A</button
                                >
                                <button
                                    class="filter-opt {filterRank === 'B'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterRank = "B")}>B</button
                                >
                            </div>
                            <div class="filter-group">
                                <span class="filter-label">Element</span>
                                <button
                                    class="filter-opt {filterElement === 'ALL'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterElement = "ALL")}
                                    >All</button
                                >
                                <button
                                    class="filter-opt {filterElement ===
                                    'Physical'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterElement = "Physical")}
                                    >Physical</button
                                >
                                <button
                                    class="filter-opt {filterElement === 'Fire'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterElement = "Fire")}
                                    >Fire</button
                                >
                                <button
                                    class="filter-opt {filterElement ===
                                    'Lightning'
                                        ? 'active'
                                        : ''}"
                                    onclick={() =>
                                        (filterElement = "Lightning")}
                                    >Lightning</button
                                >
                                <button
                                    class="filter-opt {filterElement === 'Ice'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterElement = "Ice")}
                                    >Ice</button
                                >
                                <button
                                    class="filter-opt {filterElement === 'Dark'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterElement = "Dark")}
                                    >Dark</button
                                >
                                <button
                                    class="filter-opt {filterElement === 'Void'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterElement = "Void")}
                                    >Void</button
                                >
                            </div>
                            <div class="filter-group">
                                <span class="filter-label">Class</span>
                                <button
                                    class="filter-opt {filterClass === 'ALL'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterClass = "ALL")}
                                    >All</button
                                >
                                <button
                                    class="filter-opt {filterClass ===
                                    'Attacker'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterClass = "Attacker")}
                                    >Attacker</button
                                >
                                <button
                                    class="filter-opt {filterClass === 'Tank'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterClass = "Tank")}
                                    >Tank</button
                                >
                                <button
                                    class="filter-opt {filterClass === 'Support'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterClass = "Support")}
                                    >Support</button
                                >
                                <button
                                    class="filter-opt {filterClass ===
                                    'Amplifier'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterClass = "Amplifier")}
                                    >Amplifier</button
                                >
                                <button
                                    class="filter-opt {filterClass ===
                                    'Vanguard'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterClass = "Vanguard")}
                                    >Vanguard</button
                                >
                                <button
                                    class="filter-opt {filterClass === 'Breaker'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterClass = "Breaker")}
                                    >Breaker</button
                                >
                                <button
                                    class="filter-opt {filterClass ===
                                    'Observer'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterClass = "Observer")}
                                    >Observer</button
                                >
                            </div>
                            <div class="filter-group">
                                <span class="filter-label">Affix</span>
                                <button
                                    class="filter-opt {filterAffix === 'ALL'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterAffix = "ALL")}
                                    >All</button
                                >
                                <button
                                    class="filter-opt {filterAffix === 'Plasma'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterAffix = "Plasma")}
                                    >Plasma</button
                                >
                                <button
                                    class="filter-opt {filterAffix ===
                                    'Darkflow'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterAffix = "Darkflow")}
                                    >Darkflow</button
                                >
                                <button
                                    class="filter-opt {filterAffix === 'Freez'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterAffix = "Freez")}
                                    >Freez</button
                                >
                                <button
                                    class="filter-opt {filterAffix === 'Slash'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterAffix = "Slash")}
                                    >Slash</button
                                >
                                <button
                                    class="filter-opt {filterAffix ===
                                    'Ignition'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterAffix = "Ignition")}
                                    >Ignition</button
                                >
                                <button
                                    class="filter-opt {filterAffix ===
                                    'Raydiance'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterAffix = "Raydiance")}
                                    >Raydiance</button
                                >
                                <button
                                    class="filter-opt {filterAffix ===
                                    'Дезинтеграция'
                                        ? 'active'
                                        : ''}"
                                    onclick={() =>
                                        (filterAffix = "Дезинтеграция")}
                                    >Disintegration</button
                                >
                                <button
                                    class="filter-opt {filterAffix ===
                                    'Рейдианс'
                                        ? 'active'
                                        : ''}"
                                    onclick={() => (filterAffix = "Рейдианс")}
                                    >Radiance</button
                                >
                            </div>
                        </div>
                    {/if}
                </div>
                <button
                    class="btn btn-lang"
                    onclick={() =>
                        (appState.lang = appState.lang === "ru" ? "en" : "ru")}
                >
                    {appState.lang === "ru" ? "RU" : "EN"}
                </button>
            </div>
        </header>

        <div class="roster-container">
            <div class="roster-grid">
                {#each filteredRoster as char}
                    <div class="char-card">
                        <div class={`char-avatar-box rank-bg-${char.rank}`}>
                            {#if char.avatar}
                                <img
                                    src={char.avatar}
                                    alt={char.enFrame}
                                    class="char-avatar-img"
                                />
                            {/if}
                            <div class={`char-rank text-rank-${char.rank}`}>
                                {char.rank}
                            </div>
                        </div>
                        <div class="char-info">
                            <div class="char-name">
                                {appState.lang === "ru"
                                    ? char.name
                                    : char.enName}
                            </div>
                            <div class="char-frame">
                                {appState.lang === "ru"
                                    ? char.frame
                                    : char.enFrame}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </main>
</div>

<style>
    /* Scoped layout wrapper to override global body conflicts if any, and set custom vars locally */
    .layout-wrapper {
        /* Use global variables for colors to match main style */
        /* Core Rank colors */
        --sub-rank-s: #ffb700;
        --sub-rank-a: #b700ff;
        --sub-rank-b: #00aaff;

        background-color: var(--bg-color);
        color: var(--text-color);
        font-family: var(--font-body);
        display: flex;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1000;
    }

    * {
        box-sizing: border-box;
    }

    /* Статичное компактное меню */
    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 80px;
        background-color: var(--panel-bg);
        border-right: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        padding: 20px 0;
        z-index: 100;
    }

    .nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 15px 5px;
        cursor: pointer;
        transition: background-color 0.2s;
        text-decoration: none;
        gap: 8px;
        background: transparent;
        border: none;
        width: 100%;
        color: inherit;
        font-family: inherit;
    }

    .nav-item:hover {
        background-color: #1a1a1a;
    }

    .nav-icon {
        width: 24px;
        height: 24px;
        fill: var(--text-dim);
        transition: fill 0.2s;
    }

    .nav-text {
        font-size: 10px;
        font-weight: bold;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: color 0.2s;
        text-align: center;
    }

    .nav-item:hover .nav-icon {
        fill: var(--accent-red);
    }

    .nav-item:hover .nav-text {
        color: var(--accent-red);
    }

    .main-content {
        margin-left: 80px;
        width: calc(100% - 80px);
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        height: 100vh;
    }

    /* Хедер */
    .header {
        height: 50px;
        background-color: var(--bg-color);
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        flex-shrink: 0;
    }

    .logo-text {
        font-size: 14px;
        letter-spacing: 2px;
        color: var(--text-dim);
        text-transform: uppercase;
        font-family: var(--font-header);
    }

    .logo-text span {
        color: var(--accent-red);
        font-weight: bold;
    }

    .header-controls {
        display: flex;
        gap: 10px;
    }

    .btn {
        background: transparent;
        border: 1px solid var(--border-color);
        color: var(--text-dim);
        padding: 6px 12px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        cursor: pointer;
        transition: all 0.2s;
        border-radius: 0;
        font-family: var(--font-header);
    }

    .btn:hover {
        border-color: var(--accent-red);
        color: var(--accent-red);
    }

    .btn.active {
        border-color: var(--accent-red);
        color: var(--accent-red);
        background: rgba(255, 51, 51, 0.05);
    }

    .btn-lang {
        color: var(--text-color);
        border-color: var(--border-color);
    }

    /* Панель фильтров */
    .filter-panel {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: max-content;
        max-width: 90vw;
        background-color: var(--panel-bg);
        border: 1px solid var(--border-color);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.8);
        padding: 15px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex-shrink: 0;
        z-index: 100;
    }

    .filter-group {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
    }

    .filter-label {
        font-family: var(--font-header);
        font-size: 11px;
        color: var(--text-dim);
        min-width: 60px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .filter-opt {
        background: #111;
        border: 1px solid var(--border-color);
        color: var(--text-color);
        padding: 4px 10px;
        font-size: 10px;
        font-family: var(--font-header);
        cursor: pointer;
        transition: all 0.2s;
        border-radius: 0;
        text-transform: uppercase;
    }

    .filter-opt:hover {
        border-color: #555;
    }

    .filter-opt.active {
        border-color: var(--accent-red);
        color: var(--accent-red);
        background: rgba(255, 51, 51, 0.05);
    }

    /* Сетка персонажей */
    .roster-container {
        padding: 15px;
        overflow-y: auto;
        flex-grow: 1;
    }

    .roster-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 8px;
    }

    .char-card {
        display: flex;
        flex-direction: column;
        cursor: pointer;
        transition:
            transform 0.2s,
            background-color 0.2s,
            border-color 0.2s;
        background: var(--panel-bg);
        border: 1px solid var(--border-color);
        padding: 6px;
    }

    .char-card:hover {
        transform: translateY(-2px);
        background: #111;
        border-color: #555;
    }

    .char-avatar-box {
        width: 100%;
        aspect-ratio: 1;
        border: 1px solid var(--border-color);
        position: relative;
        margin-bottom: 4px;
        transition:
            border-color 0.2s,
            filter 0.2s;
        overflow: hidden;
    }

    .char-avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        transform: scale(1);
    }

    /* Специфичные стили для рангов */
    .rank-bg-S {
        background: radial-gradient(circle at top left, #332400, #0a0700);
        border-color: #443000;
    }
    .char-card:hover .rank-bg-S {
        border-color: var(--sub-rank-s);
        filter: brightness(1.2);
    }

    .rank-bg-A {
        background: radial-gradient(circle at top left, #220033, #07000a);
        border-color: #2e0044;
    }
    .char-card:hover .rank-bg-A {
        border-color: var(--sub-rank-a);
        filter: brightness(1.2);
    }

    .rank-bg-B {
        background: radial-gradient(circle at top left, #001a33, #00050a);
        border-color: #002244;
    }
    .char-card:hover .rank-bg-B {
        border-color: var(--sub-rank-b);
        filter: brightness(1.2);
    }

    /* Ранг */
    .char-rank {
        position: absolute;
        bottom: 2px;
        right: 4px;
        font-size: 16px;
        font-weight: 900;
        font-style: italic;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.9);
        z-index: 2;
    }

    /* Цвета текста рангов */
    .text-rank-S {
        color: var(--sub-rank-s);
    }
    .text-rank-A {
        color: var(--sub-rank-a);
    }
    .text-rank-B {
        color: var(--sub-rank-b);
    }

    .char-info {
        text-align: center;
        margin-top: 2px;
    }

    .char-name {
        font-size: 13px;
        font-weight: bold;
        color: var(--text-highlight);
        text-transform: uppercase;
        margin-bottom: 2px;
        word-wrap: break-word;
        word-break: break-word;
        line-height: 1.15;
        text-align: center;
    }

    .char-frame {
        font-size: 11px;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 0.2px;
        word-wrap: break-word;
        word-break: break-word;
        line-height: 1.15;
    }

    .roster-container::-webkit-scrollbar {
        width: 6px;
    }
    .roster-container::-webkit-scrollbar-track {
        background: var(--bg-color);
    }
    .roster-container::-webkit-scrollbar-thumb {
        background: var(--border-color);
    }
    .roster-container::-webkit-scrollbar-thumb:hover {
        background: var(--accent-red);
    }
</style>
