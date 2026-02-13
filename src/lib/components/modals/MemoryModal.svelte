<script>
    import { appState } from "$lib/state.svelte.js";
    import { MEMORY_NAMES } from "$lib/data.js";

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

    let memoryList = $derived.by(() => {
        const lowerQ = searchQuery.toLowerCase();
        return MEMORY_NAMES.filter((name) =>
            name.toLowerCase().includes(lowerQ),
        ).map((name) => ({
            name,
            file: `Image/Memories/Memory-${name}-Icon-${activeSlotIndex}.webp`,
        }));
    });

    function selectMemory(name) {
        if (appState.modalData) {
            const { buildIndex, slotIndex, isHarm } = appState.modalData;
            if (isHarm && buildIndex !== undefined) {
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
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-overlay" onclick={close}>
        <div
            class="modal-content modal-mem"
            onclick={(e) => e.stopPropagation()}
        >
            <div class="modal-header">
                <h3>ВЫБОР ВОСПОМИНАНИЯ (СЛОТ {activeSlotIndex})</h3>
                <button class="modal-close" onclick={close}>X</button>
            </div>
            <input
                name="memory-search"
                type="text"
                class="modal-search"
                bind:value={searchQuery}
                placeholder="ПОИСК..."
                bind:this={searchInput}
            />

            <div class="modal-grid">
                {#each memoryList as mem}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                        class="mem-option"
                        onclick={() => selectMemory(mem.name)}
                    >
                        <img
                            class="mem-opt-img"
                            src={mem.file}
                            alt={mem.name}
                            onerror={(e) =>
                                (e.target.src =
                                    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")}
                        />
                        <span>{mem.name}</span>
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}
