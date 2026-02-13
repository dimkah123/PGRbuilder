<script>
    import { onMount } from "svelte";
    import TopNav from "$lib/components/TopNav.svelte";
    import LeftPanel from "$lib/components/LeftPanel.svelte";
    import RightPanel from "$lib/components/RightPanel.svelte";
    import { appState } from "$lib/state.svelte.js";

    // Modals
    import MemoryModal from "$lib/components/modals/MemoryModal.svelte";
    import CharacterModal from "$lib/components/modals/CharacterModal.svelte";
    import WeaponResonanceModal from "$lib/components/modals/WeaponResonanceModal.svelte";
    import ColorPicker from "$lib/components/modals/ColorPicker.svelte";
    import SettingsModal from "$lib/components/modals/SettingsModal.svelte";

    // Utils
    import {
        saveToCloud,
        loadFromUrl,
        getSaveButtonState,
    } from "$lib/utils/cloud-save.js";
    import { handleExport } from "$lib/utils/export.js";

    let isLightMode = $state(false);
    let saveBtnState = $state({ text: "СОЗДАТЬ ССЫЛКУ", style: "new" });
    let appContainer; // binding
    let settingsModal; // binding

    function toggleTheme() {
        // Add transition class
        document.body.classList.add("changing-theme");

        isLightMode = !isLightMode;
        if (isLightMode) {
            document.body.classList.add("light-theme");
        } else {
            document.body.classList.remove("light-theme");
        }

        // Remove transition class after animation
        setTimeout(() => {
            document.body.classList.remove("changing-theme");
        }, 550);
    }

    async function handleSave() {
        const result = await saveToCloud();
        if (result.success) {
            saveBtnState = getSaveButtonState();
        }
    }

    function autoScale() {
        if (!appContainer) return;
        const winW = window.innerWidth;
        const containerW = 1900;

        if (winW < containerW && winW > 1000) {
            const scale = winW / containerW;
            appContainer.style.transform = `scale(${scale})`;
            appContainer.style.transformOrigin = "top center";
            appContainer.style.zoom = "";
        } else {
            appContainer.style.transform = "none";
            appContainer.style.zoom = "";
        }
    }

    onMount(() => {
        // Init URL Load
        loadFromUrl().then(() => {
            saveBtnState = getSaveButtonState();
        });

        // AutoScale
        autoScale();
        window.addEventListener("resize", autoScale);

        return () => {
            window.removeEventListener("resize", autoScale);
        };
    });
</script>

<TopNav {toggleTheme} {isLightMode} />

<div class="app-container" bind:this={appContainer}>
    <div class="page-corner pc-tl"></div>
    <div class="page-corner pc-tr"></div>
    <div class="page-corner pc-bl"></div>
    <div class="page-corner pc-br"></div>

    <LeftPanel />
    <RightPanel />
</div>

<!-- Floating Controls -->
<div class="ctrl-panel">
    <button
        class="btn"
        style="margin-right: 10px; {saveBtnState.style === 'update'
            ? 'border-color:#4caf50; color:#4caf50;'
            : ''}"
        onclick={handleSave}
    >
        {saveBtnState.text}
    </button>
    <button class="btn" onclick={() => settingsModal.open()}>НАСТРОЙКИ</button>
    <button class="btn" onclick={() => handleExport(appState.char || "UNIT")}
        >СОХРАНИТЬ (PNG)</button
    >
</div>

<!-- Modals -->
<MemoryModal />
<CharacterModal />
<WeaponResonanceModal />
<ColorPicker />
<SettingsModal bind:this={settingsModal} />

<style>
    /* Styles are mostly global in app.css */
</style>
