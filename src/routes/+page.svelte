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
    import ProfileModal from "$lib/components/modals/ProfileModal.svelte";
    import SaveBuildModal from "$lib/components/modals/SaveBuildModal.svelte";

    // Utils
    import {
        saveToCloud,
        loadFromUrl,
        getSaveButtonState,
    } from "$lib/utils/cloud-save.js";
    import { handleExport } from "$lib/utils/export.js";
    import {
        preloadImages,
        preloadCriticalImages,
    } from "$lib/utils/image-preloader.js";
    import { MEMORY_NAMES } from "$lib/data.js";

    let isLightMode = $state(false);
    let saveBtnState = $state({ textKey: "create_link", style: "new" });
    let appContainer = $state(); // binding
    let settingsModal = $state(); // binding
    let guideModal = $state(); // binding
    let profileModal = $state(); // binding
    let saveBuildModal = $state(); // binding

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

    function handleSave() {
        saveBuildModal.open();
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
        return () => clearTimeout(timer);
    });

    $effect(() => {
        // React to auth or loaded owner changes to update button state
        const _p = appState.userProfile;
        const _o = appState.loadedBuildOwner;
        // Run in timeout to ensure state is settled if needed, though usually immediate is fine
        saveBtnState = getSaveButtonState();
    });

    onMount(() => {
        // Init URL Load
        loadFromUrl().then(async () => {
            saveBtnState = getSaveButtonState();

            // Collect critical images to block loading screen
            const criticalUrls = [];

            // 1. Character Portrait (Biggest visual impact)
            if (appState.charImg) criticalUrls.push(appState.charImg);

            // 2. Visible Memory/Weapon icons in first build
            if (appState.builds.length > 0) {
                const b = appState.builds[0];

                // Memories
                b.mems.forEach((memName, i) => {
                    if (memName && MEMORY_NAMES.includes(memName)) {
                        criticalUrls.push(
                            `Image/Memories/Memory-${memName}-Icon-${(i % 3) + 1}.webp`,
                        );
                    }
                });

                // Weapon Resonance
                if (b.wRes) {
                    b.wRes.forEach((res) => {
                        if (res && typeof res === "object" && res.file) {
                            criticalUrls.push(res.file);
                        }
                    });
                }

                // Harmony
                if (b.harm && MEMORY_NAMES.includes(b.harm)) {
                    criticalUrls.push(
                        `Image/Memories/Memory-${b.harm}-Icon-1.webp`,
                    );
                }
            }

            // Wait for critical images (max 2s)
            await preloadCriticalImages(criticalUrls);

            // Small delay to ensure render
            setTimeout(() => {
                appState.isLoading = false;

                // Start background image preloading immediately after render
                preloadImages();
            }, 50);
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
    onProfile={() => profileModal.open()}
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
<ProfileModal bind:this={profileModal} />
<SaveBuildModal
    bind:this={saveBuildModal}
    onSaveSuccess={() => (saveBtnState = getSaveButtonState())}
/>

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
