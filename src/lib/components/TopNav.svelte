<script>
    import { appState } from "$lib/state.svelte.js";

    let { toggleTheme, isLightMode = false } = $props();
</script>

<div class="top-nav">
    <div class="nav-left">
        <span>GRAY RAVEN DATABASE</span> // СБОРКА КОНСТРУКТА
    </div>
    <div class="nav-right">
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
        СИСТЕМА: ОНЛАЙН
        <div class="status-dot"></div>
    </div>
</div>

<style>
    /* Styles are global in app.css or layout.css for now, 
       but we can move specific ones here later if we want modularity */
</style>
