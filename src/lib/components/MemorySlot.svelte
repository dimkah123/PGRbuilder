<script>
    import { appState } from "$lib/state.svelte.js";
    import Combobox from "./ui/Combobox.svelte";
    import { MEMORY_NAMES } from "$lib/data.js";

    let { slotIndex, buildIndex } = $props();

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
</script>

<div class="mem-cell {memName || memImg ? 'has-item' : ''}">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="mem-remove-btn" onclick={handleRemove}>×</div>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="mem-box" onclick={handleClick}>
        {#if memImg}
            <img class="mem-img" src={memImg} alt={memName} draggable="true" />
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
