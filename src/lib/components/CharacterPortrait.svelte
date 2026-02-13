<script>
    import { appState } from "$lib/state.svelte.js";

    // UI State for controls
    let scale = $state(1);
    let x = $state(0);
    let y = $state(0);
    let isDragging = $state(false);
    let startX, startY;

    // Derived position code
    let posCode = $derived(
        `${scale.toFixed(2)}/${Math.round(x)}/${Math.round(y)}`,
    );

    function handleMouseDown(e) {
        if (
            e.target.tagName === "INPUT" ||
            e.target.closest(".portrait-placeholder") ||
            e.target.closest(".char-change-btn")
        )
            return;
        e.preventDefault();
        isDragging = true;
        startX = e.clientX - x;
        startY = e.clientY - y;
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    }

    function handleMouseMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        x = e.clientX - startX;
        y = e.clientY - startY;
    }

    function handleMouseUp() {
        isDragging = false;
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    }

    function handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        let newScale = scale + delta;
        scale = Math.min(Math.max(0.1, newScale), 5);
    }

    function applyPosCode(code) {
        const parts = code.split("/");
        if (parts.length === 3) {
            const s = parseFloat(parts[0]);
            const px = parseInt(parts[1]);
            const py = parseInt(parts[2]);
            if (!isNaN(s) && !isNaN(px) && !isNaN(py)) {
                scale = s;
                x = px;
                y = py;
            }
        }
    }

    let showControls = $state(false);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="portrait-area"
    onmousedown={handleMouseDown}
    onwheel={handleWheel}
    style="cursor: {isDragging ? 'grabbing' : 'grab'};"
>
    {#if appState.charImg}
        <img
            id="char-img"
            class="portrait-img"
            src={appState.charImg}
            alt="Character Portrait"
            style="transform: scale({scale}) translate({x}px, {y}px);"
        />

        <!-- Change Character Button -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="char-change-btn"
            onclick={() => appState.openModal("char")}
            title="Изменить персонажа"
        >
            ↻
        </div>
    {:else}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="portrait-placeholder"
            id="char-placeholder"
            onclick={() => appState.openModal("char")}
        >
            <span>+ ВЫБРАТЬ ПЕРСОНАЖА</span>
            <span style="font-size: 0.7rem; color:#9c9c9c;"
                >НАЖМИ ДЛЯ ВЫБОРА</span
            >
        </div>
    {/if}

    <!-- Image Controls -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="img-controls" onclick={(e) => e.stopPropagation()}>
        <div class="ctl-row">
            <span>Z</span><input
                type="range"
                class="slider"
                min="0.5"
                max="2.5"
                step="0.05"
                bind:value={scale}
            />
        </div>
        <div class="ctl-row">
            <span>X</span><input
                type="range"
                class="slider"
                min="-150"
                max="150"
                step="5"
                bind:value={x}
            />
        </div>
        <div class="ctl-row">
            <span>Y</span><input
                type="range"
                class="slider"
                min="-150"
                max="150"
                step="5"
                bind:value={y}
            />
        </div>
        <div class="ctl-row">
            <input
                type="text"
                placeholder="CODE"
                value={posCode}
                onchange={(e) => applyPosCode(e.target.value)}
                style="width: 80px; text-align: center; background: #222; border: 1px solid #444; color: #ff3333; font-family: monospace;"
                title="Код позиции (Scale/X/Y)"
            />
        </div>
    </div>
</div>
