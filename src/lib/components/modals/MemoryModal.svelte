<script>
    import { appState } from "$lib/state.svelte.js";
    import { MEMORY_NAMES } from "$lib/data.js";

    let searchQuery = $state("");
    let memoryList = $state([]);
    let searchInput = $state();

    $effect(() => {
        if (searchInput) {
            searchInput.focus();
        }
    });

    // Initialize list
    // We can do this once or derived.
    // MEMORY_NAMES is just names. We need slot specific images.
    // Logic from legacy: name + slot (1,2,3)

    // We need to know which slot we are selecting for to filter?
    // Legacy logic: activeSlotIndex = ((slotNum - 1) % 3) + 1;
    // But data is just name.

    let activeSlotIndex = $derived.by(() => {
        if (!appState.modalData) return 1;
        // If it's pure memory slot (0-5)
        /* 
           Slot 0 -> 1
           Slot 1 -> 2
           Slot 2 -> 3
           Slot 3 -> 1
           Slot 4 -> 2
           Slot 5 -> 3
        */
        if (appState.modalData.slotIndex !== undefined) {
            return (appState.modalData.slotIndex % 3) + 1;
        }
        return 1;
    });

    $effect(() => {
        // Re-generate list when search or slot changes
        let list = [];
        const lowerQ = searchQuery.toLowerCase();

        MEMORY_NAMES.forEach((name) => {
            if (name.toLowerCase().includes(lowerQ)) {
                // We only show the image for the current slot type (1, 2, or 3)
                // legacy: MEMORY_FULL_LIST pushed all 3, then filtered by slot.
                // We can just generate for activeSlotIndex
                list.push({
                    name: name,
                    file: `Image/Memories/Memory-${name}-Icon-${activeSlotIndex}.webp`,
                });
            }
        });
        memoryList = list;
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
