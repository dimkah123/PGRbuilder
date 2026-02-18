<script>
    import { appState } from "$lib/state.svelte.js";
    import { CHAR_DATABASE, CHARACTER_IMAGES, ASSET_MAP } from "$lib/data.js";
    import { t } from "$lib/i18n.js";
    import { fillCharacterData } from "$lib/utils/autocomplete.js";

    let searchQuery = $state("");
    let charList = $state([]);
    let searchInput = $state();

    $effect(() => {
        if (searchInput) {
            searchInput.focus();
        }
    });

    $effect(() => {
        const lowerQ = searchQuery.toLowerCase();
        charList = CHARACTER_IMAGES.map((img) => {
            const dbEntry = CHAR_DATABASE.find(
                (c) =>
                    c.enFrame &&
                    c.enFrame.toLowerCase() === img.frame.toLowerCase(),
            );
            const isEn = appState.lang === "en";
            const name = dbEntry
                ? isEn
                    ? dbEntry.enName || dbEntry.name
                    : dbEntry.name
                : "";
            const frame = dbEntry
                ? isEn
                    ? dbEntry.enFrame || dbEntry.frame
                    : dbEntry.frame
                : t(img.frame);

            let label = frame;
            if (name && frame && name !== frame) {
                label = `${name}: ${frame}`;
            } else if (name) {
                label = name;
            }

            return { ...img, label, name, frameName: frame };
        }).filter((item) => item.label.toLowerCase().includes(lowerQ));
    });

    function selectCharacter(imgData) {
        const dbEntry = CHAR_DATABASE.find(
            (c) =>
                c.enFrame &&
                c.enFrame.toLowerCase() === imgData.frame.toLowerCase(),
        );

        if (dbEntry) {
            fillCharacterData(dbEntry);
        } else {
            appState.frame = imgData.frame;
            appState.enFrame = imgData.frame;
            appState.rank = "";
            appState.element = "-";
            appState.class = "-";
            appState.weapon = "-";
            appState.cub = "-";
            appState.affix = "-";
        }

        appState.closeModal();
    }

    function close() {
        appState.closeModal();
    }
</script>

<div
    class="modal-overlay"
    class:hidden={appState.activeModal !== "char"}
    onclick={(e) => e.target === e.currentTarget && close()}
    onkeydown={(e) => e.key === "Escape" && close()}
    role="button"
    tabindex="-1"
    aria-label="Close modal"
>
    <div
        class="modal-content modal-char"
        role="dialog"
        aria-modal="true"
        aria-labelledby="char-modal-title"
        tabindex="-1"
    >
        <div class="modal-header">
            <h3 id="char-modal-title">{t("char_selection")}</h3>
            <button class="modal-close" onclick={close}>X</button>
        </div>
        <input
            type="text"
            class="modal-search"
            bind:value={searchQuery}
            placeholder={t("search")}
            bind:this={searchInput}
        />

        <div class="modal-grid">
            {#each charList as char}
                <div
                    class="modal-item"
                    onclick={() => selectCharacter(char)}
                    onkeydown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        selectCharacter(char)}
                    role="button"
                    tabindex="0"
                >
                    <img src={char.file} alt={char.frame} loading="lazy" />
                    <span>{char.label}</span>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .modal-search {
        background: #000;
        border: 1px solid #333;
        border-bottom: 2px solid var(--accent-red);
        /* Red underline */
        padding: 10px;
        color: #fff;
        font-family: var(--font-body);
        font-size: 1rem;
        width: 100%;
        margin-bottom: 10px;
    }

    .modal-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
        gap: 15px;
        overflow-y: auto;
        padding: 15px;
        padding-right: 5px;
    }

    .modal-item {
        background: #0f0f0f;
        border: 1px solid #222;
        padding: 15px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        transition: all 0.2s;
    }

    .modal-item:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
    }

    .hidden {
        display: none !important;
    }
</style>
