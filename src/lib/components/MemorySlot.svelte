<script>
    import { appState } from "$lib/state.svelte.js";
    import Combobox from "./ui/Combobox.svelte";
    import { MEMORY_NAMES } from "$lib/data.js";
    import { t } from "$lib/i18n.js";
    import { preloadMemoryImages } from "$lib/utils/image-preloader.js";
    import { onMount } from "svelte";

    let { slotIndex, buildIndex } = $props();
    let memBoxEl = $state(null);

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
        // If a touch drag just ended, skip opening the modal
        if (appState._touchDragJustEnded) {
            appState._touchDragJustEnded = false;
            return;
        }
        appState.openModal("mem", { buildIndex, slotIndex });
    }

    // === Desktop Drag & Drop (mouse) ===
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

    // === Mobile Touch Drag & Drop ===
    let touchTimer = null;
    let isDragging = false;
    let dragClone = null;
    let dragData = null;

    function handleTouchStart(e) {
        if (!memImg) return; // Nothing to drag from empty slot

        const touch = e.touches[0];
        isDragging = false;

        // Start a timer - after 300ms of holding, start dragging
        touchTimer = setTimeout(() => {
            isDragging = true;
            dragData = { memName, buildIndex, slotIndex };

            if (navigator.vibrate) navigator.vibrate(50);

            // Lock page scrolling during drag
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";

            // Create a floating clone of the image
            const img = e.target.closest(".mem-box")?.querySelector("img");
            if (img) {
                dragClone = img.cloneNode(true);
                dragClone.style.cssText = `
                    position: fixed;
                    width: 80px;
                    height: 80px;
                    object-fit: cover;
                    pointer-events: none;
                    z-index: 99999;
                    opacity: 0.85;
                    border: 2px solid #4CAF50;
                    box-shadow: 0 0 20px rgba(76, 175, 80, 0.6);
                    border-radius: 4px;
                    left: ${touch.clientX - 40}px;
                    top: ${touch.clientY - 40}px;
                    transition: none;
                `;
                document.body.appendChild(dragClone);
            }

            // Dim the source slot
            const box = e.target.closest(".mem-box");
            if (box) box.style.opacity = "0.4";

            // Highlight all other mem-boxes as potential targets
            document.querySelectorAll(".mem-box").forEach((el) => {
                if (el !== box) {
                    el.classList.add("touch-drop-target");
                }
            });
        }, 300);
    }

    function handleTouchMove(e) {
        if (!isDragging || !dragClone) {
            // If finger moved before the timer fired, cancel the drag attempt
            if (touchTimer && !isDragging) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
            return;
        }

        e.preventDefault(); // Prevent scrolling while dragging

        const touch = e.touches[0];
        dragClone.style.left = `${touch.clientX - 40}px`;
        dragClone.style.top = `${touch.clientY - 40}px`;

        // Highlight the slot under the finger
        const elementBelow = document.elementFromPoint(
            touch.clientX,
            touch.clientY,
        );
        const targetBox = elementBelow?.closest(".mem-cell");

        document.querySelectorAll(".mem-cell.touch-hover").forEach((el) => {
            el.classList.remove("touch-hover");
        });
        if (targetBox) {
            targetBox.classList.add("touch-hover");
        }
    }

    function handleTouchEnd(e) {
        if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
        }

        if (!isDragging || !dragData) {
            isDragging = false;
            return;
        }

        // Find the slot under the finger
        const touch = e.changedTouches[0];
        const elementBelow = document.elementFromPoint(
            touch.clientX,
            touch.clientY,
        );
        const targetCell = elementBelow?.closest(".mem-cell");

        if (targetCell) {
            const targetSlotAttr = targetCell.getAttribute("data-slot");
            const targetBuildAttr = targetCell.getAttribute("data-build");
            if (targetSlotAttr !== null && targetBuildAttr !== null) {
                const tSlot = parseInt(targetSlotAttr);
                const tBuild = parseInt(targetBuildAttr);
                if (!isNaN(tSlot) && !isNaN(tBuild)) {
                    appState.builds[tBuild].mems[tSlot] = dragData.memName;
                    if (navigator.vibrate) navigator.vibrate(20);
                }
            }
        }

        // Cleanup
        if (dragClone) {
            dragClone.remove();
            dragClone = null;
        }
        dragData = null;
        isDragging = false;

        // Restore opacity on source
        document.querySelectorAll(".mem-box").forEach((el) => {
            el.style.opacity = "";
        });

        // Remove all highlight classes
        document.querySelectorAll(".touch-drop-target").forEach((el) => {
            el.classList.remove("touch-drop-target");
        });
        document.querySelectorAll(".touch-hover").forEach((el) => {
            el.classList.remove("touch-hover");
        });

        // Unlock page scrolling
        document.body.style.overflow = "";
        document.body.style.touchAction = "";

        // Prevent the click event that fires after touchend from opening the modal
        appState._touchDragJustEnded = true;
        setTimeout(() => {
            appState._touchDragJustEnded = false;
        }, 100);
    }

    // Register touch listeners with { passive: false } to allow preventDefault
    onMount(() => {
        if (!memBoxEl) return;
        memBoxEl.addEventListener("touchstart", handleTouchStart, {
            passive: true,
        });
        memBoxEl.addEventListener("touchmove", handleTouchMove, {
            passive: false,
        });
        memBoxEl.addEventListener("touchend", handleTouchEnd, {
            passive: true,
        });
        return () => {
            memBoxEl.removeEventListener("touchstart", handleTouchStart);
            memBoxEl.removeEventListener("touchmove", handleTouchMove);
            memBoxEl.removeEventListener("touchend", handleTouchEnd);
        };
    });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="mem-cell {memName || memImg ? 'has-item' : ''} {dragOver
        ? 'drag-over'
        : ''}"
    data-slot={slotIndex}
    data-build={buildIndex}
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
        bind:this={memBoxEl}
        onclick={handleClick}
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
