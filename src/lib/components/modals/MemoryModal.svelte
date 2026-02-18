<script>
    import { appState } from "$lib/state.svelte.js";
    import {
        MEMORY_6STAR,
        MEMORY_5STAR,
        MEMORY_NAMES,
        MEMORY_DATABASE,
    } from "$lib/data.js";
    import { t } from "$lib/i18n.js";

    let searchQuery = $state("");
    let searchInput = $state();
    let isCompact = $state(true);

    $effect(() => {
        if (searchInput) {
            searchInput.focus();
        }
    });

    let activeSlotIndex = $derived.by(() => {
        if (!appState.modalData) return 1;
        if (appState.modalData.slotIndex !== undefined) {
            return (appState.modalData.slotIndex % 3) + 1;
        }
        return 1;
    });

    let memoryGroups = $derived.by(() => {
        const lowerQ = searchQuery.toLowerCase();

        const filterFn = (name) => name.toLowerCase().includes(lowerQ);

        const mapFn = (name, star) => {
            const memData = MEMORY_DATABASE.find((m) => m.name === name);
            return {
                name,
                star,
                effects: memData ? memData.effects : null,
                hp: memData?.hp,
                crit: memData?.crit,
                atk: memData?.atk,
                def: memData?.def,
            };
        };

        const g6 = MEMORY_6STAR.filter(filterFn).map((n) => mapFn(n, 6));
        const g5 = MEMORY_5STAR.filter(filterFn).map((n) => mapFn(n, 5));

        return [
            { title: "6 ★", items: g6 },
            { title: "5 ★", items: g5 },
        ].filter((g) => g.items.length > 0);
    });

    const isHarmRequest = $derived(appState.modalData?.isHarm);

    function selectMemory(name) {
        if (appState.modalData) {
            const { buildIndex, slotIndex, isHarm } = appState.modalData;
            if (isHarm && buildIndex !== undefined) {
                // Double check 5-star restriction
                if (MEMORY_5STAR.includes(name)) return;
                appState.builds[buildIndex].harm = name;
            } else if (buildIndex !== undefined && slotIndex !== undefined) {
                appState.builds[buildIndex].mems[slotIndex] = name;
            }
        }
        appState.closeModal();
    }

    function close() {
        appState.closeModal();
    }
</script>

<div
    class="modal-overlay"
    class:hidden={appState.activeModal !== "mem"}
    onclick={(e) => e.target === e.currentTarget && close()}
    onkeydown={(e) => e.key === "Escape" && close()}
    role="button"
    tabindex="-1"
    aria-label="Close modal"
>
    <div
        class="modal-content modal-mem"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mem-modal-title"
        tabindex="-1"
    >
        <div class="modal-header">
            <h3 id="mem-modal-title">
                {t("memory_selection")} ({t("slot")}
                {activeSlotIndex})
            </h3>
            <button class="modal-close" onclick={close}>X</button>
        </div>
        <div class="search-row">
            <div class="search-box">
                <input
                    bind:this={searchInput}
                    type="text"
                    class="modal-search"
                    placeholder={t("search")}
                    bind:value={searchQuery}
                />
                {#if searchQuery}
                    <button
                        class="clear-search"
                        onclick={() => (searchQuery = "")}>✕</button
                    >
                {/if}
            </div>
            <button
                class="view-toggle-btn"
                onclick={() => (isCompact = !isCompact)}
                title={isCompact ? "Show Details" : "Compact View"}
            >
                {isCompact ? "👁️" : "≣"}
            </button>
        </div>

        <div class="modal-body">
            {#each memoryGroups as group}
                <div class="memory-group-section">
                    <div
                        class="memory-group-title"
                        class:five-star={group.title.includes("5")}
                    >
                        {group.title}
                    </div>
                    <div
                        class="modal-grid {isCompact
                            ? 'compact-grid'
                            : 'detail-grid'}"
                    >
                        {#each group.items as mem (mem.name)}
                            <div
                                class="mem-option"
                                class:disabled={isHarmRequest && mem.star === 5}
                                onclick={() =>
                                    !(isHarmRequest && mem.star === 5) &&
                                    selectMemory(mem.name)}
                                onkeydown={(e) =>
                                    (e.key === "Enter" || e.key === " ") &&
                                    !(isHarmRequest && mem.star === 5) &&
                                    selectMemory(mem.name)}
                                role="button"
                                tabindex={isHarmRequest && mem.star === 5
                                    ? -1
                                    : 0}
                                title={isHarmRequest && mem.star === 5
                                    ? t("msg_no_5star_harm") ||
                                      "5-star cannot be used for harmonization"
                                    : ""}
                            >
                                <div class="mem-opt-header">
                                    <div class="mem-img-wrap">
                                        <!-- Slot 1 Icon -->
                                        <img
                                            class="mem-opt-img"
                                            class:hidden={activeSlotIndex !== 1}
                                            src={`Image/Memories/Memory-${mem.name}-Icon-1.webp`}
                                            alt={mem.name}
                                            crossorigin="anonymous"
                                            loading="lazy"
                                            onerror={(e) =>
                                                (e.target.src =
                                                    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")}
                                        />
                                        <!-- Slot 2 Icon -->
                                        <img
                                            class="mem-opt-img"
                                            class:hidden={activeSlotIndex !== 2}
                                            src={`Image/Memories/Memory-${mem.name}-Icon-2.webp`}
                                            alt={mem.name}
                                            crossorigin="anonymous"
                                            loading="lazy"
                                            onerror={(e) =>
                                                (e.target.src =
                                                    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")}
                                        />
                                        <!-- Slot 3 Icon -->
                                        <img
                                            class="mem-opt-img"
                                            class:hidden={activeSlotIndex !== 3}
                                            src={`Image/Memories/Memory-${mem.name}-Icon-3.webp`}
                                            alt={mem.name}
                                            crossorigin="anonymous"
                                            loading="lazy"
                                            onerror={(e) =>
                                                (e.target.src =
                                                    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")}
                                        />

                                        {#if isHarmRequest && mem.star === 5}
                                            <div class="mem-lock-overlay">
                                                🔒
                                            </div>
                                        {/if}
                                    </div>
                                    <span class="mem-name">{mem.name}</span>
                                </div>
                                {#if !isCompact && mem.effects && (mem.effects.twoPiece[appState.lang] || mem.effects.twoPiece["en"] || mem.effects.fourPiece[appState.lang] || mem.effects.fourPiece["en"])}
                                    <div class="mem-effects-wrap">
                                        {#if mem.effects.twoPiece[appState.lang] || mem.effects.twoPiece["en"]}
                                            <div class="mem-effect">
                                                <span class="mem-effect-label"
                                                    >2-Set</span
                                                >
                                                <span class="mem-effect-text"
                                                    >{mem.effects.twoPiece[
                                                        appState.lang
                                                    ] ||
                                                        mem.effects.twoPiece[
                                                            "en"
                                                        ]}</span
                                                >
                                            </div>
                                        {/if}
                                        {#if mem.effects.fourPiece[appState.lang] || mem.effects.fourPiece["en"]}
                                            <div class="mem-effect">
                                                <span class="mem-effect-label"
                                                    >4-Set</span
                                                >
                                                <span class="mem-effect-text"
                                                    >{mem.effects.fourPiece[
                                                        appState.lang
                                                    ] ||
                                                        mem.effects.fourPiece[
                                                            "en"
                                                        ]}</span
                                                >
                                            </div>
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .modal-header h3 {
        margin: 0;
        flex-shrink: 0;
    }
    .modal-header .modal-close {
        margin-left: 10px;
    }
    .search-row {
        display: grid;
        grid-template-columns: 1fr 36px; /* Search box takes space, button fixed square width */
        gap: 10px;
        align-items: center; /* Strict vertical centering for row items */
        padding: 15px 20px; /* Match header horizontal padding (20px) and increase vertical (15px) */
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        box-sizing: border-box; /* Fix width overflow */
    }
    .search-box {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        height: 36px; /* Explicit item height */
        margin: 0; /* Prevent shifts */
    }
    .search-box input {
        width: 100%;
        height: 100%; /* Fill the search-box container */
        padding-right: 30px; /* Space for clear button */
        box-sizing: border-box;
        margin: 0; /* Prevent shifts */
    }

    .modal-search {
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #fff;
        padding: 0 12px; /* Horizontal padding only */
        font-family: var(--font-tech);
        font-size: 0.9rem;
        line-height: 34px; /* Matches height (36px) minus borders (2px) */
        outline: none;
        transition: border-color 0.2s;
        box-sizing: border-box;
        display: block; /* Standard display */
        margin: 0; /* Prevent shifts */
    }
    .modal-search:focus {
        border-color: var(--accent-red);
        background: rgba(0, 0, 0, 0.6);
    }
    .search-box .clear-search {
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #aaa;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0 5px;
    }
    .modal-body {
        max-height: 85vh; /* Increase height for more content visibility */
        overflow-y: auto;
        padding-right: 10px;
        padding-bottom: 30px; /* Add padding to prevent clipping at bottom */
    }
    /* Grid Layouts - applied to .modal-grid */
    .modal-body :global(.modal-grid.compact-grid) {
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    }

    .modal-body :global(.modal-grid.detail-grid) {
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    }

    /* Default fallback */
    .modal-body :global(.modal-grid) {
        grid-gap: 10px;
    }

    /* Override global .modal-grid if needed, but here we use specific classes */
    .modal-body :global(.modal-grid) {
        /* Reset this to allow our dynamic classes to work if .mem-list has .modal-grid */
        grid-template-columns: unset;
    }

    .mem-option {
        display: block;
        overflow: hidden; /* clearfix for floated mem-opt-left */
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        padding: 10px;
        transition:
            transform 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        cursor: pointer;
        position: relative;
        height: auto;
        min-height: 0;
        text-align: left;
    }
    .mem-option:hover {
        transform: translateY(-2px);
        border-color: rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    /* Compact View Adjustments */
    :global(.compact-grid) .mem-option {
        text-align: center;
        min-height: 120px;
    }

    :global(.compact-grid) .mem-opt-header {
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    /* Increase specificity to override default scoped styles */
    :global(.compact-grid) .mem-opt-header .mem-opt-img {
        width: 64px;
        height: 64px;
    }

    :global(.compact-grid) .mem-opt-header .mem-img-wrap {
        width: 64px;
        min-width: 64px;
        height: 64px;
    }

    .view-toggle-btn {
        background: transparent;
        border: 1px solid #444;
        color: #fff;
        width: 36px; /* Match search height (square) */
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        font-size: 1.2rem;
        margin-right: 0; /* Remove margin, handled by parent flex gap */
        transition: 0.2s;
        flex-shrink: 0;
        box-sizing: border-box; /* Ensure border is included in height */
    }
    .view-toggle-btn:hover {
        border-color: var(--accent-red);
        color: var(--accent-red);
    }
    .memory-group-section {
        margin-bottom: 20px;
    }
    .memory-group-title {
        display: flex;
        align-items: center;
        color: var(--accent-red);
        font-size: 1.1rem;
        font-weight: bold;
        margin: 12px 0 2px 15px; /* Minimal bottom spacing */
        text-shadow: 0 0 10px rgba(255, 62, 62, 0.4);
        white-space: nowrap;
    }
    .memory-group-title::after {
        content: "";
        flex-grow: 1;
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
        margin-left: 15px;
    }
    .memory-group-title.five-star {
        color: #ffb400; /* Gold/Orange */
        text-shadow: 0 0 10px rgba(255, 180, 0, 0.4);
    }
    .memory-group-title.five-star::after {
        background: rgba(255, 180, 0, 0.2);
    }
    .mem-img-wrap {
        position: relative;
        width: 65px;
        min-width: 65px;
        display: flex;
        justify-content: center;
    }
    .mem-lock-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        border-radius: 4px;
        backdrop-filter: blur(2px);
    }
    .mem-option.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        filter: grayscale(0.5);
    }
    .mem-option.disabled:hover {
        background: transparent;
        transform: none;
        border-color: transparent;
    }
    .mem-opt-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
    }
    .mem-opt-header .mem-img-wrap {
        width: 36px;
        min-width: 36px;
        height: 36px;
    }
    .mem-opt-header .mem-opt-img {
        width: 36px;
        height: 36px;
        border-radius: 4px;
    }
    .mem-option .mem-name {
        font-size: 0.85rem;
        font-weight: 600;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #d0d0d0 !important;
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
    }

    .mem-effects-wrap {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .mem-effect {
        text-align: left;
    }
    .mem-effect-label {
        display: inline;
        color: var(--accent-red);
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-right: 6px;
    }
    .mem-effect-text {
        display: inline;
        color: #ccc;
        font-size: 0.8rem;
        line-height: 1.5;
        font-family: var(--font-body);
    }
    .hidden {
        display: none !important;
    }
</style>
