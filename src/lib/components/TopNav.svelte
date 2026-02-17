<script>
    import { appState } from "$lib/state.svelte.js";
    import { t } from "$lib/i18n.js";
    import { fade } from "svelte/transition";

    let {
        onSave,
        onExport,
        onGuide,
        onSettings,
        onToggleTheme,
        isLightMode,
        saveBtnState,
    } = $props();
    let isToolsOpen = $state(false);

    function handleToolClick(action) {
        action();
        isToolsOpen = false;
    }
</script>

<div class="top-nav">
    <div class="nav-left">
        <span>{t("system_database")}</span>
        {#key appState.lang}
            <span class="desktop-status-text" in:fade={{ duration: 300 }}>
                // {t("build_constructor")}</span
            >
        {/key}
    </div>
    <div class="nav-right">
        <!-- Desktop Actions -->
        <div class="desktop-actions">
            <button
                class="btn nav-btn {saveBtnState.style === 'update'
                    ? 'btn-update'
                    : ''}"
                onclick={onSave}
            >
                {#key appState.lang}
                    <span in:fade={{ duration: 300 }}
                        >{t(saveBtnState.textKey)}</span
                    >
                {/key}
            </button>
            <button class="btn nav-btn" onclick={onExport}>
                {#key appState.lang}
                    <span in:fade={{ duration: 300 }}>{t("save_png")}</span>
                {/key}
            </button>
            <button class="btn nav-btn" onclick={onGuide}>
                {#key appState.lang}
                    <span in:fade={{ duration: 300 }}>{t("guide")}</span>
                {/key}
            </button>
            <button class="btn nav-btn" onclick={onSettings}>
                {#key appState.lang}
                    <span in:fade={{ duration: 300 }}>{t("settings")}</span>
                {/key}
            </button>
        </div>

        <div class="nav-separator"></div>

        <!-- Language Switcher -->
        <button
            class="btn lang-toggle toggle-btn"
            onclick={() => appState.toggleLanguage()}
            title={t("language")}
        >
            {appState.lang.toUpperCase()}
        </button>

        <!-- Mobile Tools Menu -->
        <div class="mobile-tools-container">
            <button
                class="btn tools-toggle"
                onclick={() => (isToolsOpen = !isToolsOpen)}
            >
                {#key appState.lang}
                    <span in:fade={{ duration: 300 }}>{t("tools")}</span>
                {/key}
            </button>
            {#if isToolsOpen}
                <div class="tools-dropdown">
                    <button onclick={() => handleToolClick(onSave)}
                        >{t("create_link")}</button
                    >
                    <button onclick={() => handleToolClick(onToggleTheme)}>
                        {isLightMode ? t("dark_mode") : t("light_mode")}
                    </button>
                    <button onclick={() => handleToolClick(onExport)}
                        >{t("save_png")}</button
                    >
                    <button onclick={() => handleToolClick(onGuide)}
                        >{t("guide")}</button
                    >
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .mobile-tools-container {
        position: relative;
        display: none; /* Hidden by default (Desktop) */
    }

    .tools-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: #000;
        border: 1px solid #333;
        display: flex;
        flex-direction: column;
        width: 150px;
        z-index: 1000;
        margin-top: 5px;
    }

    .tools-dropdown button {
        background: transparent;
        border: none;
        border-bottom: 1px solid #222;
        color: #ccc;
        padding: 10px;
        text-align: left;
        font-family: inherit;
        font-size: 0.75rem;
        cursor: pointer;
    }

    .tools-dropdown button:last-child {
        border-bottom: none;
    }

    .tools-dropdown button:hover {
        background: #111;
        color: #fff;
    }

    /* Mobile Styles */
    @media screen and (max-width: 1024px) {
        .mobile-tools-container {
            display: block;
        }
    }

    .desktop-status-text {
        color: #fff;
    }

    .toggle-btn {
        padding: 5px 10px;
        font-size: 0.7rem;
        cursor: pointer;
        text-transform: uppercase;
        border: 1px solid #444;
        transition: all 0.2s ease;
    }

    .lang-toggle {
        min-width: 45px;
        background: #000;
        color: #fff;
    }

    /* Keep theme toggle consistent with mode */
    :global(.light-theme) .lang-toggle {
        background: #fff;
        color: #000;
    }

    .toggle-btn:hover,
    .tools-toggle:hover,
    .nav-btn:hover {
        border-color: var(--accent-red);
        color: var(--accent-red);
    }

    .desktop-actions {
        display: flex;
        gap: 10px;
    }

    .nav-btn {
        padding: 5px 15px;
        font-size: 0.75rem;
    }

    .nav-separator {
        width: 1px;
        height: 24px;
        background: #333;
        margin: 0 10px;
    }

    /* Hide desktop actions on mobile */
    @media screen and (max-width: 1024px) {
        .desktop-actions,
        .nav-separator {
            display: none;
        }
    }
</style>
