<script>
    import { appState } from "$lib/state.svelte.js";
    import { CHAR_DATABASE, CHARACTER_IMAGES, ASSET_MAP } from "$lib/data.js";
    import { t } from "$lib/i18n.js";

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
                : img.frame;

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
            const isEn = appState.lang === "en";
            appState.char = isEn
                ? dbEntry.enName || dbEntry.name
                : dbEntry.name;
            appState.frame = isEn
                ? dbEntry.enFrame || dbEntry.frame
                : dbEntry.frame;
            appState.enFrame = dbEntry.enFrame;
            appState.rank = dbEntry.rank;
            appState.element = dbEntry.element;
            appState.class = dbEntry.class;

            const weaponName = (dbEntry.weapon || "").toLowerCase().trim();
            if (weaponName && ASSET_MAP[weaponName]) {
                appState.weapon = t("signature");
                appState.weaponReal = dbEntry.weapon;
            } else {
                appState.weapon = dbEntry.weapon || "-";
                appState.weaponReal = "";
            }

            const cubName = (dbEntry.cub || "").toLowerCase().trim();
            if (cubName && ASSET_MAP[cubName]) {
                appState.cub = t("signature_cub");
                appState.cubReal = dbEntry.cub;
            } else {
                appState.cub = dbEntry.cub || "-";
                appState.cubReal = "";
            }

            appState.affix = dbEntry.affix || "-";
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

{#if appState.activeModal === "char"}
    <div
        class="modal-overlay"
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
{/if}
