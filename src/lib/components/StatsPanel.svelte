<script>
    import { appState } from "$lib/state.svelte.js";
    import Combobox from "./ui/Combobox.svelte";
    import {
        WEAPON_IMAGES,
        CUB_IMAGES,
        ELEMENT_NAMES,
        CLASS_NAMES,
    } from "$lib/data.js";
    import { t } from "$lib/i18n.js";

    // Options mapping with localized labels
    let classOptions = $derived(
        Object.keys(CLASS_NAMES[appState.lang]).map((key) => ({
            label: CLASS_NAMES[appState.lang][key],
            value: CLASS_NAMES[appState.lang][key],
        })),
    );

    let elementOptions = $derived(
        Object.keys(ELEMENT_NAMES[appState.lang]).map((key) => ({
            label: ELEMENT_NAMES[appState.lang][key],
            value: ELEMENT_NAMES[appState.lang][key],
        })),
    );

    const RANK_OPTIONS = ["B", "A", "S", "SS", "SSS", "SSS+"];

    // Combine element names for affix options
    let affixOptions = $derived(
        Object.keys(ELEMENT_NAMES[appState.lang]).map((key) => ({
            label: ELEMENT_NAMES[appState.lang][key],
            value: ELEMENT_NAMES[appState.lang][key],
        })),
    );

    const WEAPON_OPTIONS = Object.keys(WEAPON_IMAGES).sort();
    const CUB_OPTIONS = Object.keys(CUB_IMAGES).sort();
</script>

<div class="stats-container {appState.char ? '' : 'ui-locked'}">
    <div class="stats-row main-stats-row">
        <div class="stat-box">
            <span class="stat-label">{t("class")}</span>
            {#if appState.classImg}
                <img
                    class="stat-icon"
                    src={appState.classImg}
                    width="60"
                    height="60"
                    alt="Class"
                />
            {/if}
            <div class="combobox-container">
                <Combobox
                    name="char-class"
                    class="stat-input"
                    bind:value={appState.class}
                    placeholder="-"
                    options={classOptions}
                />
            </div>
        </div>
        <div class="stat-box">
            <span class="stat-label">{t("element")}</span>
            {#if appState.elementImg}
                <img
                    class="stat-icon"
                    src={appState.elementImg}
                    width="60"
                    height="60"
                    alt="Element"
                />
            {/if}
            <div class="combobox-container">
                <Combobox
                    name="char-element"
                    class="stat-input"
                    bind:value={appState.element}
                    placeholder="-"
                    options={elementOptions}
                />
            </div>
        </div>
        <div class="stat-box">
            <span class="stat-label">{t("weapon")}</span>
            {#if appState.weaponImg}
                <img
                    id="weapon-img"
                    class="stat-icon"
                    src={appState.weaponImg}
                    width="60"
                    height="60"
                    alt="Weapon"
                />
            {/if}
            <div class="combobox-container">
                <Combobox
                    name="char-weapon"
                    class="stat-input"
                    bind:value={appState.weapon}
                    placeholder="-"
                    options={WEAPON_OPTIONS}
                />
            </div>
        </div>
    </div>

    <div class="stats-row">
        <div class="stat-box">
            <span class="stat-label">{t("affix")}</span>
            {#if appState.affixImg}
                <img
                    id="affix-img"
                    class="stat-icon"
                    src={appState.affixImg}
                    width="60"
                    height="60"
                    alt="Affix"
                />
            {/if}
            <div class="combobox-container">
                <Combobox
                    name="char-affix"
                    class="stat-input"
                    bind:value={appState.affix}
                    placeholder="-"
                    options={affixOptions}
                />
            </div>
        </div>
        <div class="stat-box">
            <span class="stat-label">{t("cub")}</span>
            {#if appState.cubImg}
                <img
                    id="cub-img"
                    class="stat-icon"
                    src={appState.cubImg}
                    width="60"
                    height="60"
                    alt="CUB"
                />
            {/if}
            <div class="combobox-container">
                <Combobox
                    name="char-cub"
                    class="stat-input"
                    bind:value={appState.cub}
                    placeholder="-"
                    options={CUB_OPTIONS}
                />
            </div>
        </div>
        <div class="stat-box rank-box">
            <span class="stat-label">{t("rank")}</span>
            <div class="combobox-container">
                <Combobox
                    name="char-rank"
                    class="stat-input rank-input"
                    bind:value={appState.rank}
                    placeholder="-"
                    options={RANK_OPTIONS}
                />
            </div>
        </div>
    </div>
</div>

<style>
    .combobox-container {
        width: 100%;
        position: relative;
    }

    /* Ensure stat-input style is preserved/passed down */
    /* Accessing global styles or pass-through classes */
</style>
