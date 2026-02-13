<script>
    import { appState } from "$lib/state.svelte.js";
    import CharacterPortrait from "./CharacterPortrait.svelte";
    import StatsPanel from "./StatsPanel.svelte";
    import Combobox from "./ui/Combobox.svelte";
    import { CHAR_DATABASE } from "$lib/data.js";
    import { fillCharacterData } from "$lib/utils/autocomplete.js";
    import { t } from "$lib/i18n.js";

    // Prepare options for autocomplete
    let nameOptions = $derived(
        CHAR_DATABASE.map((c) => {
            const frameDisplay =
                appState.lang === "ru" ? c.frame : c.enFrame || c.frame;
            const nameDisplay = c.name; // Keep RU name for now or translate if available
            return {
                label: frameDisplay
                    ? `${nameDisplay}: ${frameDisplay}`
                    : nameDisplay,
                value: nameDisplay,
                data: c,
            };
        }),
    );

    let frameOptions = $derived(
        CHAR_DATABASE.map((c) => {
            const frameDisplay =
                appState.lang === "ru" ? c.frame : c.enFrame || c.frame;
            const nameDisplay = c.name;
            return {
                label: frameDisplay
                    ? `${nameDisplay}: ${frameDisplay}`
                    : nameDisplay,
                value: frameDisplay,
                data: c,
            };
        }),
    );

    function onNameSelect(opt) {
        if (opt.data) {
            fillCharacterData(opt.data);
        } else {
            appState.char = opt.value || opt;
        }
    }

    function onFrameSelect(opt) {
        if (opt.data) {
            fillCharacterData(opt.data);
        }
    }
</script>

<div class="left-panel">
    <CharacterPortrait />

    <div class="name-plate">
        <div class="combobox-container">
            <Combobox
                id="char-name-input"
                name="char-name"
                class="char-name-input"
                bind:value={appState.char}
                placeholder={t("change_char")}
                options={nameOptions}
                onSelect={onNameSelect}
                showOnFocus={false}
                strict={true}
            />
        </div>
        <div class="combobox-container">
            <Combobox
                id="frame-name-input"
                name="frame-name"
                class="frame-name-input"
                bind:value={appState.frame}
                placeholder={t("frame")}
                options={frameOptions}
                onSelect={onFrameSelect}
                showOnFocus={false}
                strict={true}
            />
        </div>
    </div>

    <StatsPanel />
</div>

<style>
    /* Name Plate */
    .name-plate {
        padding: 10px 20px;
        border-left: 4px solid var(--accent-red);
        margin: 10px 0;
        display: flex;
        flex-direction: column;
        overflow: visible;
        position: relative;
        z-index: 50; /* High z-index for dropdowns */
    }

    /* Target inputs inside Combobox using :global */
    :global(.name-plate .char-name-input) {
        width: 100%;
        background: transparent !important;
        border: none !important;
        color: #fff !important;
        font-family: var(--font-header);
        font-weight: 700;
        font-size: 2.5rem;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 0px;
        line-height: 1.1;
        padding: 0;
        display: block;
    }

    :global(.name-plate .frame-name-input) {
        width: 100%;
        background: transparent !important;
        border: none !important;
        color: var(--accent-red) !important;
        font-family: var(--font-header);
        font-weight: 600;
        font-size: 1.2rem;
        text-transform: uppercase;
        letter-spacing: 4px;
        line-height: 1.2;
        padding-top: 2px;
    }

    .combobox-container {
        width: 100%;
        position: relative;
    }
</style>
