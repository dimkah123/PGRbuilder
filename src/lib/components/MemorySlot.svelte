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

    function handleClick(e) {
        if (appState.draggedMemory) {
            // We have a dragged memory, so this tap is a paste action
            if (appState.draggedMemory.memName !== memName) {
                appState.builds[buildIndex].mems[slotIndex] =
                    appState.draggedMemory.memName;
                if (navigator.vibrate) navigator.vibrate(20);
            }
            appState.draggedMemory = null; // Consume the paste buffer
            e.stopPropagation();
            e.preventDefault();
            return;
        }

        // Normal click opens the selector modal
        appState.openModal("mem", { buildIndex, slotIndex });
    }

    function handleDragStart(e) {
        e.dataTransfer.setData(
            "text/plain",
            JSON.stringify({ buildIndex, slotIndex, memName }),
        );
        e.dataTransfer.effectAllowed = "copy";
    }

    let touchTimer = null;
    let isLongPress = false;

    function handlePointerDown(e) {
        if (!memName) return; // Can't copy an empty slot

        isLongPress = false;
        // Start 500ms timer for long press
        touchTimer = setTimeout(() => {
            isLongPress = true;
            if (navigator.vibrate) navigator.vibrate(50);
            appState.draggedMemory = { memName };
            e.target.style.opacity = "0.5";
            setTimeout(() => (e.target.style.opacity = "1"), 300);
        }, 500);
    }

    function handlePointerUpOrCancel(e) {
        if (touchTimer) clearTimeout(touchTimer);
        // We removed the paste logic from here, as 'click' handles it better on mobile
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
    import { t } from "$lib/i18n.js";
    import { preloadMemoryImages } from "$lib/utils/image-preloader.js";
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="mem-cell {memName || memImg ? 'has-item' : ''} {dragOver
        ? 'drag-over'
        : ''} {appState.draggedMemory?.memName === memName && memName
        ? 'is-copied'
        : ''} {appState.draggedMemory &&
    appState.draggedMemory.memName !== memName
        ? 'is-drop-target'
        : ''}"
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    onmouseenter={preloadMemoryImages}
    aria-label="Memory slot {slotIndex + 1}"
>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="mem-remove-btn"
        onclick={handleRemove}
        role="button"
        tabindex="0"
    >
        ×
    </div>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="mem-box"
        onclick={handleClick}
        onpointerdown={handlePointerDown}
        onpointerup={handlePointerUpOrCancel}
        onpointercancel={handlePointerUpOrCancel}
        oncontextmenu={(e) => {
            e.preventDefault();
            return false;
        }}
        role="button"
        tabindex="0"
    >
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
            name="memory-{slotIndex}"
            class="mem-input"
            bind:value={appState.builds[buildIndex].mems[slotIndex]}
            placeholder={t("mem_placeholder")}
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
