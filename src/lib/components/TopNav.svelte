<script>
    import { appState } from "$lib/state.svelte.js";

    let { toggleTheme, isLightMode = false, onSave, onExport } = $props();
    let isToolsOpen = $state(false);

    function handleToolClick(action) {
        action();
        isToolsOpen = false;
    }
</script>

<div class="top-nav">
    <div class="nav-left">
        <span>GRAY RAVEN DATABASE</span> // СБОРКА КОНСТРУКТА
    </div>
    <div class="nav-right">
        <!-- Mobile Tools Menu -->
        <div class="mobile-tools-container">
            <button
                class="btn tools-toggle"
                onclick={() => (isToolsOpen = !isToolsOpen)}
            >
                ИНСТРУМЕНТЫ
            </button>
            {#if isToolsOpen}
                <div class="tools-dropdown">
                    <button onclick={() => handleToolClick(onSave)}
                        >СОЗДАТЬ ССЫЛКУ</button
                    >
                    <button onclick={() => handleToolClick(onExport)}
                        >СОХРАНИТЬ PNG</button
                    >
                </div>
            {/if}
        </div>

        <button
            id="theme-toggle"
            class="btn"
            style="padding: 5px 10px; font-size: 0.7rem; background: {isLightMode
                ? '#fff'
                : '#000'}; color: {isLightMode ? '#000' : '#fff'};"
            onclick={toggleTheme}
        >
            {isLightMode ? "DARK MODE" : "LIGHT MODE"}
        </button>
        <div class="desktop-status">
            СИСТЕМА: ОНЛАЙН
            <div class="status-dot"></div>
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
    @media screen and (max-width: 768px) {
        .mobile-tools-container {
            display: block;
        }

        .desktop-status {
            display: none; /* Hide status text on mobile to save space */
        }
    }
</style>
