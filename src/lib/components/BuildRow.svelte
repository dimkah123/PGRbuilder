<script>
    import { appState } from "$lib/state.svelte.js";
    import MemorySlot from "./MemorySlot.svelte";
    import RichTextEditor from "./RichTextEditor.svelte";
    import ResonanceSelect from "./ResonanceSelect.svelte";
    import Combobox from "./ui/Combobox.svelte";
    import { MEMORY_NAMES } from "$lib/data.js";
    import { t } from "$lib/i18n.js";

    let { build, index, isLoading = false } = $props();
    // ... (rest of props logic is fine, just updated the destructuring)

    let resSkillTopOptions = $derived([
        t("atk_15"),
        "Red Orb",
        "Blue Orb",
        "Yellow Orb",
    ]);
    // ...

    // Note: I need to target the top div.

    const RES_SKILL_BOTTOM_OPTIONS = [
        "Core Passive",
        "Signature Move",
        "Class Passive",
    ];

    function removeBuild() {
        appState.removeBuild(index);
    }
    let harmDragOver = $state(false);

    function harmDragStart(e) {
        e.dataTransfer.setData(
            "text/plain",
            JSON.stringify({ buildIndex: index, memName: build.harm }),
        );
        e.dataTransfer.effectAllowed = "copy";
    }

    function harmDragOver_(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        harmDragOver = true;
    }

    function harmDragLeave() {
        harmDragOver = false;
    }

    function harmDrop(e) {
        e.preventDefault();
        harmDragOver = false;
        try {
            const data = JSON.parse(e.dataTransfer.getData("text/plain"));
            if (data.memName && MEMORY_NAMES.includes(data.memName)) {
                build.harm = data.memName;
            }
        } catch {}
    }
</script>

<div class="build-row {isLoading ? 'no-transition' : ''}">
    <div class="build-title">
        <span class="build-num">{(index + 1).toString().padStart(2, "0")}</span>
        //
        <input
            name="build-title"
            type="text"
            bind:value={build.title}
            placeholder={t("enter_title")}
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
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="harm-col {build.harm ? 'has-item' : ''} {harmDragOver
            ? 'drag-over'
            : ''}"
        ondragover={harmDragOver_}
        ondragleave={harmDragLeave}
        ondrop={harmDrop}
    >
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
                        draggable="true"
                        ondragstart={harmDragStart}
                    />
                {/if}
            </div>
        </div>
        <div class="combobox-container">
            <Combobox
                name="build-harm"
                class="harm-input"
                bind:value={build.harm}
                placeholder={t("harm")}
                options={MEMORY_NAMES}
                showOnFocus={false}
                strict={true}
            />
        </div>
    </div>

    <!-- 3. Resonance -->
    <div class="res-col">
        <div class="res-group">
            <div class="res-label">{t("top_res")}</div>
            <div class="res-row">
                <ResonanceSelect bind:value={build.resTopSlot} />
                <div class="combobox-container res-combobox">
                    <Combobox
                        name="build-res-top-skill"
                        class="res-skill-input"
                        bind:value={build.resTopSkill}
                        placeholder={t("skill")}
                        options={resSkillTopOptions}
                    />
                </div>
            </div>
        </div>
        <div class="res-group">
            <div class="res-label">{t("bot_res")}</div>
            <div class="res-row">
                <ResonanceSelect bind:value={build.resBotSlot} />
                <div class="combobox-container res-combobox">
                    <Combobox
                        name="build-res-bot-skill"
                        class="res-skill-input"
                        bind:value={build.resBotSkill}
                        placeholder={t("skill")}
                        options={RES_SKILL_BOTTOM_OPTIONS}
                    />
                </div>
            </div>
        </div>

        <!-- Weapon Resonance -->
        <div class="weapon-res-group">
            <div class="res-label">{t("weapon_res_title")}</div>
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
                                    if (build.wRes) build.wRes[wIndex] = null;
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
                                {#if typeof build.wRes[wIndex] === "object" && build.wRes[wIndex].file}
                                    <img
                                        src={build.wRes[wIndex].file}
                                        alt={build.wRes[wIndex].name}
                                    />
                                {:else}
                                    <div class="wres-fallback">
                                        {build.wRes[wIndex]}
                                    </div>
                                {/if}
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <!-- 4. Description -->
    <div class="tac-box">
        <div class="tac-header">{t("tactical_analysis")}</div>
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
