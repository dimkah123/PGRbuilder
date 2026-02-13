<script>
    import { onMount } from "svelte";
    import { appState } from "$lib/state.svelte.js";

    let isOpen = $state(false);

    // Default values matching CSS
    let charWidth = $state(1000);
    let memWidth = $state(1000);
    let wresWidth = $state(1200);
    let wresCols = $state(8);

    function open() {
        isOpen = true;
        loadSettings();
    }

    function close() {
        isOpen = false;
    }

    function loadSettings() {
        const stored = localStorage.getItem("pgr-builder-settings-v5");
        if (stored) {
            const data = JSON.parse(stored);
            charWidth = data.charWidth || 1000;
            memWidth = data.memWidth || 1000;
            wresWidth = data.wresWidth || 1200;
            wresCols = data.wresCols || 8;
        }
        applySettings();
    }

    function saveSettings() {
        const data = {
            charWidth,
            memWidth,
            wresWidth,
            memWidth,
            wresWidth,
            wresCols,
        };
        localStorage.setItem("pgr-builder-settings-v5", JSON.stringify(data));
        applySettings();
    }

    function applySettings() {
        const root = document.documentElement;
        root.style.setProperty("--modal-width-char", `${charWidth}px`);
        root.style.setProperty("--modal-width-mem", `${memWidth}px`);
        root.style.setProperty("--modal-width-wres", `${wresWidth}px`);
        root.style.setProperty("--wres-cols", wresCols);
    }

    function resetDefaults() {
        charWidth = 1000;
        memWidth = 1000;
        wresWidth = 1200;
        wresCols = 8;
        saveSettings();
    }

    // transform export to function to be callable from outside if needed,
    // but simpler to just bind to window or event.
    // For now, checks state? No, better to export a trigger or use appState.
    // Let's use a custom event or bind to a global function for simplicity in this context
    // or just export the helper.

    // Better: Add to appState or just export a function if using module context.
    // Since this is a component, we'll export the open function via context or prop binding?
    // Easiest for this existing structure: Just put the button in +page and bind.

    export { open };

    onMount(() => {
        loadSettings();
    });
    import { t } from "$lib/i18n.js";
</script>

{#if isOpen}
    <div
        class="modal-overlay"
        onclick={(e) => e.target === e.currentTarget && close()}
        onkeydown={(e) => e.key === "Escape" && close()}
        role="button"
        tabindex="-1"
        aria-label="Close modal"
    >
        <div
            class="modal-content settings-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            tabindex="-1"
        >
            <div class="modal-header">
                <h3 id="settings-title">{t("interface_settings")}</h3>
                <button class="modal-close" onclick={close}>X</button>
            </div>

            <div class="settings-body">
                <div class="setting-group">
                    <label for="charWidth">
                        {t("char_window_width")}:
                        <span class="val">{charWidth}px</span>
                    </label>
                    <input
                        id="charWidth"
                        type="range"
                        min="500"
                        max="1800"
                        step="50"
                        bind:value={charWidth}
                        oninput={applySettings}
                        onchange={saveSettings}
                    />
                </div>

                <div class="setting-group">
                    <label for="memWidth">
                        {t("mem_window_width")}:
                        <span class="val">{memWidth}px</span>
                    </label>
                    <input
                        id="memWidth"
                        type="range"
                        min="500"
                        max="1800"
                        step="50"
                        bind:value={memWidth}
                        oninput={applySettings}
                        onchange={saveSettings}
                    />
                </div>

                <div class="setting-group">
                    <div class="group-title">{t("wres_window")}</div>
                    <label for="wresWidth">
                        {t("width")}: <span class="val">{wresWidth}px</span>
                    </label>
                    <input
                        id="wresWidth"
                        type="range"
                        min="100"
                        max="1800"
                        step="10"
                        bind:value={wresWidth}
                        oninput={applySettings}
                        onchange={saveSettings}
                    />

                    <label for="wresCols">
                        {t("columns")}: <span class="val">{wresCols}</span>
                    </label>
                    <input
                        id="wresCols"
                        type="range"
                        min="2"
                        max="14"
                        step="1"
                        bind:value={wresCols}
                        oninput={applySettings}
                        onchange={saveSettings}
                    />
                </div>

                <div class="actions">
                    <button class="btn" onclick={resetDefaults}
                        >{t("reset")}</button
                    >
                    <button class="btn save-btn" onclick={close}
                        >{t("done")}</button
                    >
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .settings-modal {
        width: 500px;
        max-width: 90%;
        height: auto;
        max-height: 90vh;
        background: var(--panel-bg);
        border: 1px solid var(--border-color);
    }

    .settings-body {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 25px;
        color: var(--text-color);
    }

    .setting-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-bottom: 15px;
        border-bottom: 1px solid var(--border-color);
        opacity: 0.9;
    }

    .group-title {
        color: var(--accent-red);
        font-family: var(--font-header);
        margin-bottom: 5px;
        letter-spacing: 1px;
    }

    label {
        font-family: var(--font-body);
        font-size: 0.9rem;
        display: flex;
        justify-content: space-between;
    }

    .val {
        color: var(--accent-red);
        font-family: var(--font-tech);
    }

    input[type="range"] {
        width: 100%;
        cursor: pointer;
        opacity: 0.8;
        transition: 0.2s;
    }

    input[type="range"]:hover {
        opacity: 1;
    }

    .actions {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
    }

    .save-btn {
        border-color: var(--accent-red);
        color: var(--accent-red);
    }
</style>
