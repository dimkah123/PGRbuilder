<script>
    import { appState } from "$lib/state.svelte.js";
    import MemorySlot from "./MemorySlot.svelte";
    import RichTextEditor from "./RichTextEditor.svelte";
    import ResonanceSelect from "./ResonanceSelect.svelte";
    import Combobox from "./ui/Combobox.svelte";
    import { MEMORY_NAMES } from "$lib/data.js";

    let { build, index } = $props();

    const RES_SKILL_TOP_OPTIONS = [
        "+15 АТК",
        "Red Orb",
        "Blue Orb",
        "Yellow Orb",
    ];
    const RES_SKILL_BOTTOM_OPTIONS = [
        "Core Passive",
        "Signature Move",
        "Class Passive",
    ];

    function removeBuild() {
        appState.removeBuild(index);
    }
</script>

<div class="build-row">
    <div class="build-title">
        <span class="build-num">{(index + 1).toString().padStart(2, "0")}</span>
        //
        <input
            type="text"
            bind:value={build.title}
            placeholder="ВВЕДИТЕ НАЗВАНИЕ"
            autocomplete="off"
        />
    </div>

    <!-- 1. Memories Grid -->
    <div class="mem-grid">
        {#each [0, 1, 2, 3, 4, 5] as slotIndex}
            <MemorySlot buildIndex={index} {slotIndex} />
        {/each}
    </div>

    <!-- 2. Harmony -->
    <div class="harm-col {build.harm ? 'has-item' : ''}">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        {#if build.harm && MEMORY_NAMES.includes(build.harm)}
            <div
                class="mem-remove-btn"
                onclick={(e) => {
                    e.stopPropagation();
                    build.harm = "";
                }}
            >
                ×
            </div>
        {/if}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="harm-slot"
            onclick={() =>
                appState.openModal("mem", { buildIndex: index, isHarm: true })}
        >
            <div class="mem-box">
                {#if build.harm && MEMORY_NAMES.includes(build.harm)}
                    <img
                        src={`Image/Memories/Memory-${build.harm}-Icon-1.webp`}
                        alt={build.harm}
                    />
                {/if}
            </div>
        </div>
        <div class="combobox-container">
            <Combobox
                class="harm-input"
                bind:value={build.harm}
                placeholder="ГАРМ"
                options={MEMORY_NAMES}
                showOnFocus={false}
                strict={true}
            />
        </div>
    </div>

    <!-- 3. Resonance -->
    <div class="res-col">
        <div class="res-group">
            <div class="res-label">ВЕРХ. РЕЗОНАНС</div>
            <div class="res-row">
                <ResonanceSelect bind:value={build.resTopSlot} />
                <div class="combobox-container res-combobox">
                    <Combobox
                        class="res-skill-input"
                        bind:value={build.resTopSkill}
                        placeholder="НАВЫК"
                        options={RES_SKILL_TOP_OPTIONS}
                    />
                </div>
            </div>
        </div>
        <div class="res-group">
            <div class="res-label">НИЖН. РЕЗОНАНС</div>
            <div class="res-row">
                <ResonanceSelect bind:value={build.resBotSlot} />
                <div class="combobox-container res-combobox">
                    <Combobox
                        class="res-skill-input"
                        bind:value={build.resBotSkill}
                        placeholder="НАВЫК"
                        options={RES_SKILL_BOTTOM_OPTIONS}
                    />
                </div>
            </div>
        </div>

        <!-- Weapon Resonance -->
        <div class="weapon-res-group">
            <div class="res-label">РЕЗОНАНСЫ ОРУЖИЯ</div>
            <div class="weapon-res-row">
                {#each [0, 1, 2] as wIndex}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                        class="weapon-res-cell {build.wRes && build.wRes[wIndex]
                            ? 'has-item'
                            : ''}"
                    >
                        {#if build.wRes && build.wRes[wIndex]}
                            <div
                                class="mem-remove-btn"
                                onclick={(e) => {
                                    e.stopPropagation();
                                    build.wRes[wIndex] = null;
                                }}
                            >
                                ×
                            </div>
                        {/if}
                        <div
                            class="weapon-res-box"
                            onclick={() =>
                                appState.openModal("wres", {
                                    buildIndex: index,
                                    slotIndex: wIndex,
                                })}
                        >
                            {#if build.wRes && build.wRes[wIndex]}
                                <img
                                    src={build.wRes[wIndex].file}
                                    alt={build.wRes[wIndex].name}
                                />
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <!-- 4. Description -->
    <div class="tac-box">
        <div class="tac-header">ТАКТИЧЕСКИЙ АНАЛИЗ</div>
        <div class="rich-editor-container">
            <!-- ContentEditable logic needs careful Svelte implementation or just textarea -->
            <RichTextEditor bind:value={build.desc} />
        </div>
    </div>

    <!-- 5. Delete -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="btn-del" onclick={removeBuild}>×</div>
</div>

<style>
    .combobox-container {
        width: 100%;
        position: relative;
    }

    .res-combobox {
        flex: 1;
        min-width: 0;
    }

    /* Override input styles that might conflict with Combobox wrapper layout */
    :global(.res-combobox input) {
        width: 100% !important;
        flex: none !important;
        min-width: 0 !important;
    }
</style>
