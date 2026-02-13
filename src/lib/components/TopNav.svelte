<script>
    import { appState } from "$lib/state.svelte.js";
    import { t } from "$lib/i18n.js";

    let {
        toggleTheme,
        isLightMode = false,
        onSave,
        onExport,
        onSettings,
    } = $props();
    let isToolsOpen = $state(false);

    function handleToolClick(action) {
        action();
        isToolsOpen = false;
    }
</script>

<div class="top-nav">
    <div class="nav-left">
        <span>GRAY RAVEN DATABASE</span><span class="desktop-status-text">
            // {t("build_constructor")}</span
        >
    </div>
    <div class="nav-right">
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
                {t("tools")}
            </button>
            {#if isToolsOpen}
                <div class="tools-dropdown">
                    <button onclick={() => handleToolClick(onSave)}
                        >{t("create_link")}</button
                    >
                    <button onclick={() => handleToolClick(onExport)}
                        >{t("save_png")}</button
                    >
                </div>
            {/if}
        </div>

        <button
            id="theme-toggle"
            class="btn toggle-btn {isLightMode ? 'light' : 'dark'}"
            onclick={toggleTheme}
        >
            {isLightMode ? t("dark_mode") : t("light_mode")}
        </button>
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

    .toggle-btn.dark {
        background: #000;
        color: #fff;
    }

    .toggle-btn.light {
        background: #fff;
        color: #000;
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
    .tools-toggle:hover {
        border-color: var(--accent-red);
        color: var(--accent-red);
    }
</style>
