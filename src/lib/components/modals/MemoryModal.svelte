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
                file: `Image/Memories/Memory-${name}-Icon-${activeSlotIndex}.webp`,
                effects: memData ? memData.effects : null,
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

{#if appState.activeModal === "mem"}
    <div
        class="modal-overlay"
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
            <input
                name="memory-search"
                type="text"
                class="modal-search"
                bind:value={searchQuery}
                placeholder={t("search")}
                bind:this={searchInput}
            />

            <div class="modal-body">
                {#each memoryGroups as group}
                    <div class="memory-group-section">
                        <div
                            class="memory-group-title"
                            class:five-star={group.title.includes("5")}
                        >
                            {group.title}
                        </div>
                        <div class="modal-grid">
                            {#each group.items as mem}
                                <div
                                    class="mem-option"
                                    class:disabled={isHarmRequest &&
                                        mem.star === 5}
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
                                    <div class="mem-opt-left">
                                        <div class="mem-opt-img-wrapper">
                                            <img
                                                class="mem-opt-img"
                                                src={mem.file}
                                                alt={mem.name}
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
                                        <span>{mem.name}</span>
                                    </div>
                                    {#if mem.effects && (mem.effects.twoPiece[appState.lang] || mem.effects.fourPiece[appState.lang])}
                                        <div class="mem-opt-right">
                                            {#if mem.effects.twoPiece[appState.lang]}
                                                <div class="mem-effect">
                                                    <span
                                                        class="mem-effect-label"
                                                        >2-Set</span
                                                    >
                                                    <span
                                                        class="mem-effect-text"
                                                        >{mem.effects.twoPiece[
                                                            appState.lang
                                                        ]}</span
                                                    >
                                                </div>
                                            {/if}
                                            {#if mem.effects.fourPiece[appState.lang]}
                                                <div class="mem-effect">
                                                    <span
                                                        class="mem-effect-label"
                                                        >4-Set</span
                                                    >
                                                    <span
                                                        class="mem-effect-text"
                                                        >{mem.effects.fourPiece[
                                                            appState.lang
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
{/if}

<style>
    .modal-body {
        max-height: 70vh;
        overflow-y: auto;
        padding-right: 10px;
    }
    .modal-body :global(.modal-grid) {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
    .modal-body :global(.mem-option) {
        flex-direction: row;
        align-items: flex-start;
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
        margin: 20px 0 10px 15px;
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
    .mem-opt-img-wrapper {
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
    .mem-opt-left {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        min-width: 70px;
        flex-shrink: 0;
    }
    .mem-opt-right {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
        min-width: 0;
        border-left: 1px solid rgba(255, 255, 255, 0.06);
        padding-left: 8px;
    }
    .mem-effect {
        text-align: left;
    }
    .mem-effect-label {
        display: block;
        color: var(--accent-red);
        font-size: 0.55rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 1px;
    }
    .mem-effect-text {
        display: block;
        color: #999;
        font-size: 0.6rem;
        line-height: 1.25;
        font-family: var(--font-body);
    }
</style>
