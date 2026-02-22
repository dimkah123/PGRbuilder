<script>
    import { onMount } from "svelte";
    import { appState } from "$lib/state.svelte.js";
    import { t } from "$lib/i18n.js";
    import { CHAR_DATABASE } from "$lib/data.js";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import ProfileModal from "$lib/components/modals/ProfileModal.svelte";

    let profileModal = $state(null);
    let googleReady = $state(false);
    let client = null;

    function loadGoogleLibrary() {
        const existingScript = document.getElementById("google-gsi-script");
        if (existingScript) existingScript.remove();

        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = `https://accounts.google.com/gsi/client?hl=${appState.lang}`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            /* global google */
            client = google.accounts.oauth2.initCodeClient({
                client_id:
                    "64823134414-44hmn7s4ro6bhdu9ub82a5gi092pq0nj.apps.googleusercontent.com",
                scope: "email profile",
                ux_mode: "popup",
                callback: handleAuthCodeResponse,
            });
            googleReady = true;
        };
        document.head.appendChild(script);
    }

    $effect(() => {
        // Reload Google Library when language changes
        const l = appState.lang; // Dependency
        if (typeof window !== "undefined") {
            googleReady = false; // Reset readiness
            loadGoogleLibrary();
        }
    });

    async function handleAuthCodeResponse(response) {
        if (response.code) {
            try {
                const res = await fetch("/api/auth/google", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: response.code }),
                });

                if (!res.ok) {
                    throw new Error("Failed to verify code");
                }

                const data = await res.json();
                appState.sessionToken = data.sessionToken;
                appState.userProfile = data.userProfile;

                localStorage.setItem(
                    "pgr_session_token",
                    appState.sessionToken,
                );
                localStorage.setItem(
                    "pgr_user_profile",
                    JSON.stringify(appState.userProfile),
                );
            } catch (e) {
                console.error("Failed to exchange code", e);
                alert(`${t("msg_save_error") || "Error:"} ${e.message}`);
            }
        }
    }

    let roster = $state([]);
    let showFilters = $state(false);
    let filterRank = $state("ALL");
    let filterElement = $state("ALL");
    let filterClass = $state("ALL");
    let filterAffix = $state("ALL");
    let filterContainer;

    function handleWindowClick(e) {
        if (
            showFilters &&
            filterContainer &&
            !filterContainer.contains(e.target)
        ) {
            showFilters = false;
        }
    }

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
        "BLACK★ROCK: SHOOTER",
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

    // Build head icon path from frame name (or enName for collabs with no frame)
    // Head files: Dialogue-{Frame}-Icon.webp (spaces removed)
    function getHeadIcon(frame, name) {
        const key = frame || name;
        if (!key) return "";
        const cleaned = key.replace(/\s+/g, "");
        return `/Image/Characters/Head/Dialogue-${cleaned}-Icon.webp`;
    }

    onMount(() => {
        // Load real characters from CHAR_DATABASE
        const rawRoster = CHAR_DATABASE.map((char, index) => {
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
                avatar: getHeadIcon(char.enFrame, char.enName),
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

<ProfileModal bind:this={profileModal} />

<svelte:window onclick={handleWindowClick} />

<div class="layout-wrapper">
    <header class="header">
        <div class="logo-text">
            {#if appState.lang === "ru"}
                <span>GRAY RAVEN DB</span> // СПИСОК КОНСТРУКТОВ
            {:else}
                <span>GRAY RAVEN DB</span> // CONSTRUCT ROSTER
            {/if}
        </div>
        <div class="header-controls">
            <div style="position: relative;" bind:this={filterContainer}>
                <button
                    class="btn btn-filter {showFilters ? 'active' : ''}"
                    onclick={() => (showFilters = !showFilters)}
                >
                    {t("filters")}
                </button>

                {#if showFilters}
                    <div class="filter-panel">
                        <div class="filter-group">
                            <span class="filter-label">{t("rank")}</span>
                            <button
                                class="filter-opt {filterRank === 'ALL'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterRank = "ALL")}
                                >{t("filter_all")}</button
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
                            <span class="filter-label">{t("element")}</span>
                            <button
                                class="filter-opt {filterElement === 'ALL'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterElement = "ALL")}
                                >{t("filter_all")}</button
                            >
                            <button
                                class="filter-opt {filterElement === 'Physical'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterElement = "Physical")}
                                >{t("filter_physical")}</button
                            >
                            <button
                                class="filter-opt {filterElement === 'Fire'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterElement = "Fire")}
                                >{t("filter_fire")}</button
                            >
                            <button
                                class="filter-opt {filterElement === 'Lightning'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterElement = "Lightning")}
                                >{t("filter_lightning")}</button
                            >
                            <button
                                class="filter-opt {filterElement === 'Ice'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterElement = "Ice")}
                                >{t("filter_ice")}</button
                            >
                            <button
                                class="filter-opt {filterElement === 'Dark'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterElement = "Dark")}
                                >{t("filter_dark")}</button
                            >
                            <button
                                class="filter-opt {filterElement === 'Void'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterElement = "Void")}
                                >{t("filter_void")}</button
                            >
                        </div>
                        <div class="filter-group">
                            <span class="filter-label">{t("class")}</span>
                            <button
                                class="filter-opt {filterClass === 'ALL'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterClass = "ALL")}
                                >{t("filter_all")}</button
                            >
                            <button
                                class="filter-opt {filterClass === 'Attacker'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterClass = "Attacker")}
                                >{t("filter_attacker")}</button
                            >
                            <button
                                class="filter-opt {filterClass === 'Tank'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterClass = "Tank")}
                                >{t("filter_tank")}</button
                            >
                            <button
                                class="filter-opt {filterClass === 'Support'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterClass = "Support")}
                                >{t("filter_support")}</button
                            >
                            <button
                                class="filter-opt {filterClass === 'Amplifier'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterClass = "Amplifier")}
                                >{t("filter_amplifier")}</button
                            >
                            <button
                                class="filter-opt {filterClass === 'Vanguard'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterClass = "Vanguard")}
                                >{t("filter_vanguard")}</button
                            >
                            <button
                                class="filter-opt {filterClass === 'Breaker'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterClass = "Breaker")}
                                >{t("filter_breaker")}</button
                            >
                            <button
                                class="filter-opt {filterClass === 'Observer'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterClass = "Observer")}
                                >{t("filter_observer")}</button
                            >
                        </div>
                        <div class="filter-group">
                            <span class="filter-label">{t("affix")}</span>
                            <button
                                class="filter-opt {filterAffix === 'ALL'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterAffix = "ALL")}
                                >{t("filter_all")}</button
                            >
                            <button
                                class="filter-opt {filterAffix === 'Plasma'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterAffix = "Plasma")}
                                >{t("filter_plasma")}</button
                            >
                            <button
                                class="filter-opt {filterAffix === 'Darkflow'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterAffix = "Darkflow")}
                                >{t("filter_darkflow")}</button
                            >
                            <button
                                class="filter-opt {filterAffix === 'Freez'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterAffix = "Freez")}
                                >{t("filter_freez")}</button
                            >
                            <button
                                class="filter-opt {filterAffix === 'Slash'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterAffix = "Slash")}
                                >{t("filter_slash")}</button
                            >
                            <button
                                class="filter-opt {filterAffix === 'Ignition'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterAffix = "Ignition")}
                                >{t("filter_ignition")}</button
                            >
                            <button
                                class="filter-opt {filterAffix === 'Raydiance'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterAffix = "Raydiance")}
                                >{t("filter_raydiance")}</button
                            >
                            <button
                                class="filter-opt {filterAffix ===
                                'Дезинтеграция'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterAffix = "Дезинтеграция")}
                                >{t("filter_disintegration")}</button
                            >
                            <button
                                class="filter-opt {filterAffix === 'Рейдианс'
                                    ? 'active'
                                    : ''}"
                                onclick={() => (filterAffix = "Рейдианс")}
                                >{t("filter_radiance")}</button
                            >
                        </div>
                    </div>
                {/if}
            </div>
            <div class="nav-separator"></div>

            <button
                class="btn btn-lang"
                onclick={() =>
                    (appState.lang = appState.lang === "ru" ? "en" : "ru")}
            >
                {appState.lang === "ru" ? "RU" : "EN"}
            </button>

            <!-- Login / Profile -->
            {#if (appState.sessionToken || appState.userToken) && appState.userProfile}
                <button
                    class="avatar-btn"
                    onclick={() => profileModal.open()}
                    title={appState.userProfile.name}
                >
                    <img
                        src={appState.userProfile.picture}
                        alt="Avatar"
                        class="nav-avatar"
                    />
                </button>
            {:else}
                <button
                    class="btn google-login-btn"
                    onclick={() => client && client.requestCode()}
                    disabled={!googleReady}
                >
                    {t("login") || "Sign In"}
                </button>
            {/if}
        </div>
    </header>

    <div class="body-row">
        <Sidebar />

        <main class="main-content">
            <div class="roster-container">
                <div class="roster-grid">
                    {#each filteredRoster as char}
                        <a
                            href="/?char={encodeURIComponent(
                                char.enFrame || char.frame,
                            )}"
                            class="char-card"
                        >
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
                        </a>
                    {/each}
                </div>
            </div>
        </main>
    </div>
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
        flex-direction: column;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1000;
    }

    .body-row {
        display: flex;
        flex: 1;
        overflow: hidden;
    }

    * {
        box-sizing: border-box;
    }

    /* Статичное компактное меню */
    .sidebar {
        width: 80px;
        min-width: 80px;
        height: 100%;
        background-color: var(--panel-bg);
        border-right: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        padding: 20px 0;
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
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
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
        align-items: center;
        gap: 10px;
    }

    .btn {
        background: transparent;
        border: 1px solid #444;
        color: #fff;
        padding: 5px 15px;
        font-size: 0.75rem;
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
        min-width: 45px;
        background: #000;
        color: #fff;
    }

    .google-login-btn {
        background: #000;
        font-weight: bold;
    }

    .google-login-btn:hover {
        border-color: var(--accent-red);
        color: var(--accent-red);
    }

    .google-login-btn:disabled {
        opacity: 0.4;
        cursor: default;
    }

    .nav-separator {
        width: 1px;
        height: 24px;
        background: #333;
        margin: 0 10px;
    }

    .filter-panel {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: max-content;
        max-width: 90vw;
        background-color: #0a0a0a;
        border: 1px solid #333;
        box-shadow:
            0 8px 30px rgba(0, 0, 0, 0.9),
            0 0 1px rgba(255, 51, 51, 0.2);
        padding: 18px 24px;
        display: flex;
        flex-direction: column;
        gap: 0;
        flex-shrink: 0;
        z-index: 100;
    }

    .filter-group {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        padding: 10px 0;
        border-bottom: 1px solid #1a1a1a;
    }

    .filter-group:last-child {
        border-bottom: none;
    }

    .filter-label {
        font-family: var(--font-header);
        font-size: 13px;
        color: var(--accent-red);
        min-width: 80px;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        font-weight: 800;
        text-shadow: 0 0 8px rgba(255, 51, 51, 0.3);
    }

    .filter-opt {
        background: #0f0f0f;
        border: 1px solid #2a2a2a;
        color: #ccc;
        padding: 6px 14px;
        font-size: 12px;
        font-family: var(--font-header);
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
        border-radius: 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .filter-opt:hover {
        border-color: #666;
        color: #fff;
        background: #1a1a1a;
    }

    .filter-opt.active {
        border-color: var(--accent-red);
        color: #fff;
        background: rgba(255, 51, 51, 0.15);
        box-shadow: 0 0 8px rgba(255, 51, 51, 0.2);
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
        text-decoration: none;
        color: inherit;
        transition:
            transform 0.2s,
            background-color 0.2s,
            border-color 0.2s;
        background: var(--panel-bg);
        border: 1px solid var(--border-color);
        padding: 6px;
        will-change: transform;
        backface-visibility: hidden;
    }

    .char-card:hover {
        transform: translateY(-2px);
        background: #111;
        border-color: #555;
    }

    .avatar-btn {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        border-radius: 50%;
        transition: transform 0.2s;
    }

    .avatar-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 0 10px var(--accent-red);
    }

    .nav-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid #555;
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
    }

    .rank-bg-A {
        background: radial-gradient(circle at top left, #220033, #07000a);
        border-color: #2e0044;
    }
    .char-card:hover .rank-bg-A {
        border-color: var(--sub-rank-a);
    }

    .rank-bg-B {
        background: radial-gradient(circle at top left, #001a33, #00050a);
        border-color: #002244;
    }
    .char-card:hover .rank-bg-B {
        border-color: var(--sub-rank-b);
    }

    /* Ранг */
    .char-rank {
        position: absolute;
        bottom: 2px;
        right: 4px;
        font-size: 16px;
        font-weight: 900;
        font-style: italic;
        text-shadow:
            -1px -1px 0 #000,
            1px -1px 0 #000,
            -1px 1px 0 #000,
            1px 1px 0 #000,
            0 0 6px rgba(0, 0, 0, 0.8);
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
        font-size: 11.5px;
        font-weight: 600;
        color: var(--accent-red);
        text-shadow: 0 0 6px rgba(255, 51, 51, 0.4);
        text-transform: uppercase;
        letter-spacing: 0.2px;
        word-wrap: break-word;
        word-break: break-word;
        line-height: 1.15;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
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
