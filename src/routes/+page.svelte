<script>
    import { onMount } from "svelte";
    import TopNav from "$lib/components/TopNav.svelte";
    import LeftPanel from "$lib/components/LeftPanel.svelte";
    import RightPanel from "$lib/components/RightPanel.svelte";
    import { t } from "$lib/i18n.js";
    import { appState } from "$lib/state.svelte.js";

    // Modals
    import MemoryModal from "$lib/components/modals/MemoryModal.svelte";
    import CharacterModal from "$lib/components/modals/CharacterModal.svelte";
    import WeaponResonanceModal from "$lib/components/modals/WeaponResonanceModal.svelte";
    import ColorPicker from "$lib/components/modals/ColorPicker.svelte";
    import SettingsModal from "$lib/components/modals/SettingsModal.svelte";
    import GuideModal from "$lib/components/modals/GuideModal.svelte";

    // Utils
    import {
        saveToCloud,
        loadFromUrl,
        getSaveButtonState,
    } from "$lib/utils/cloud-save.js";
    import { handleExport } from "$lib/utils/export.js";

    let isLightMode = $state(false);
    let saveBtnState = $state({ textKey: "create_link", style: "new" });
    let appContainer = $state(); // binding
    let settingsModal = $state(); // binding
    let guideModal = $state(); // binding

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
        // Use 950 to ensure scaling kicks in for 1024px/1200px screens
        const minDesktopW = 950;

        if (winW < containerW && winW > minDesktopW) {
            // Add 40px buffer (20px each side) for "16:9 like" spacing
            const scale = (winW - 40) / containerW;
            appContainer.style.width = `${containerW}px`; // Force full width layout
            appContainer.style.transform = `scale(${scale})`;
            appContainer.style.transformOrigin = "top center"; // Center it back
            appContainer.style.marginLeft = "";
            appContainer.style.alignSelf = ""; // Let Flexbox center it
            appContainer.style.zoom = "";
        } else {
            appContainer.style.width = ""; // Reset to CSS default
            appContainer.style.transform = "none";
            appContainer.style.zoom = "";
            appContainer.style.transformOrigin = "";
            appContainer.style.marginLeft = "";
            appContainer.style.alignSelf = "";
        }
    }

    let isLangChanging = $state(false);

    $effect(() => {
        // Pulse when language changes
        const currentLang = appState.lang;
        isLangChanging = true;
        const timer = setTimeout(() => {
            isLangChanging = false;
        }, 600);
        return () => clearTimeout(timer);
    });

    onMount(() => {
        // Init URL Load
        loadFromUrl().then(() => {
            saveBtnState = getSaveButtonState();
            // Small delay to ensure render
            setTimeout(() => {
                appState.isLoading = false;
            }, 100);
        });

        // AutoScale
        autoScale();
        window.addEventListener("resize", autoScale);

        return () => {
            window.removeEventListener("resize", autoScale);
        };
    });
</script>

<TopNav
    onSave={handleSave}
    onExport={() => handleExport(appState.char || "UNIT")}
    onSettings={() => settingsModal.open()}
    onGuide={() => guideModal.open()}
    onToggleTheme={toggleTheme}
    {isLightMode}
    {saveBtnState}
/>

<div
    class="app-container"
    class:lang-changing={isLangChanging}
    bind:this={appContainer}
    style="opacity: {appState.isLoading ? 0 : 1};"
>
    <div class="page-corner pc-tl"></div>
    <div class="page-corner pc-tr"></div>
    <div class="page-corner pc-bl"></div>
    <div class="page-corner pc-br"></div>

    <LeftPanel />
    <RightPanel />
</div>

<!-- Floating Controls -->

<!-- Modals -->
<MemoryModal />
<CharacterModal />
<WeaponResonanceModal />
<ColorPicker />
<SettingsModal bind:this={settingsModal} {toggleTheme} {isLightMode} />
<GuideModal bind:this={guideModal} />

<style>
    /* Styles are mostly global in app.css */

    :global(.lang-changing span),
    :global(.lang-changing label),
    :global(.lang-changing .stat-label),
    :global(.lang-changing .res-label),
    :global(.lang-changing .tac-header),
    :global(.lang-changing .section-header span) {
        animation: holographic-refresh-inline 0.6s ease-in-out;
    }

    :global(.lang-changing input),
    :global(.lang-changing .stat-value),
    :global(.lang-changing .build-title),
    :global(.lang-changing .add-build-wide-btn) {
        animation: holographic-refresh-block 0.6s ease-in-out;
    }

    @keyframes holographic-refresh-inline {
        0% {
            opacity: 1;
            filter: blur(0px);
        }
        30% {
            opacity: 0.5;
            filter: blur(4px);
            color: var(--accent-red);
        }
        100% {
            opacity: 1;
            filter: blur(0px);
        }
    }

    @keyframes holographic-refresh-block {
        0% {
            opacity: 1;
            filter: blur(0px);
            transform: scale(1);
        }
        30% {
            opacity: 0.5;
            filter: blur(4px);
            transform: scale(1.02);
            color: var(--accent-red);
        }
        100% {
            opacity: 1;
            filter: blur(0px);
            transform: scale(1);
        }
    }
</style>
