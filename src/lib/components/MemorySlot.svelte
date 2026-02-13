<script>
    import { appState } from "$lib/state.svelte.js";
    import Combobox from "./ui/Combobox.svelte";
    import { MEMORY_NAMES } from "$lib/data.js";

    let { slotIndex, buildIndex } = $props();

    let dragOver = $state(false);

    // Derived value for the image
    let memName = $derived(appState.builds[buildIndex]?.mems[slotIndex] || "");
    let memImg = $derived(
        memName && MEMORY_NAMES.includes(memName)
            ? `Image/Memories/Memory-${memName}-Icon-${(slotIndex % 3) + 1}.webp`
            : "",
    );

    function handleRemove(e) {
        e.stopPropagation();
        appState.builds[buildIndex].mems[slotIndex] = "";
    }

    function handleClick() {
        appState.openModal("mem", { buildIndex, slotIndex });
    }

    function handleDragStart(e) {
        e.dataTransfer.setData(
            "text/plain",
            JSON.stringify({ buildIndex, slotIndex, memName }),
        );
        e.dataTransfer.effectAllowed = "copy";
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        dragOver = true;
    }

    function handleDragLeave() {
        dragOver = false;
    }

    function handleDrop(e) {
        e.preventDefault();
        dragOver = false;
        try {
            const data = JSON.parse(e.dataTransfer.getData("text/plain"));
            if (data.memName && MEMORY_NAMES.includes(data.memName)) {
                appState.builds[buildIndex].mems[slotIndex] = data.memName;
            }
        } catch {}
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="mem-cell {memName || memImg ? 'has-item' : ''} {dragOver
        ? 'drag-over'
        : ''}"
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="mem-remove-btn" onclick={handleRemove}>×</div>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="mem-box" onclick={handleClick}>
        {#if memImg}
            <img
                class="mem-img"
                src={memImg}
                alt={memName}
                draggable="true"
                ondragstart={handleDragStart}
            />
        {/if}
    </div>

    <div class="combobox-container">
        <Combobox
            class="mem-input"
            bind:value={appState.builds[buildIndex].mems[slotIndex]}
            placeholder="МЕМ"
            options={MEMORY_NAMES}
            showOnFocus={false}
            strict={true}
        />
    </div>
</div>

<style>
    .combobox-container {
        width: 100%;
        position: relative;
    }
</style>
