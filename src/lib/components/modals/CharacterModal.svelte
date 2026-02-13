<script>
    import { appState } from "$lib/state.svelte.js";
    import { CHAR_DATABASE, CHARACTER_IMAGES, ASSET_MAP } from "$lib/data.js";

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
            const name = dbEntry ? dbEntry.name : "";
            const frame = dbEntry ? dbEntry.frame : img.frame;

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
        // Find DB entry
        const dbEntry = CHAR_DATABASE.find(
            (c) =>
                c.enFrame &&
                c.enFrame.toLowerCase() === imgData.frame.toLowerCase(),
        );

        // Update State
        if (dbEntry) {
            appState.char = dbEntry.name;
            appState.frame = dbEntry.frame; // Russian Frame
            appState.enFrame = dbEntry.enFrame;
            appState.rank = dbEntry.rank;
            appState.element = dbEntry.element;
            appState.class = dbEntry.class;

            // Weapon Logic
            const weaponName = (dbEntry.weapon || "").toLowerCase().trim();
            if (weaponName && ASSET_MAP[weaponName]) {
                appState.weapon = "СИГНАТУРНОЕ";
                appState.weaponReal = dbEntry.weapon;
            } else {
                appState.weapon = dbEntry.weapon || "-";
                appState.weaponReal = "";
            }

            // CUB Logic
            const cubName = (dbEntry.cub || "").toLowerCase().trim();
            if (cubName && ASSET_MAP[cubName]) {
                appState.cub = "СИГНАТУРНЫЙ"; // Display Name
                appState.cubReal = dbEntry.cub; // Image Key Name
            } else {
                appState.cub = dbEntry.cub || "-";
                appState.cubReal = "";
            }

            appState.affix = dbEntry.affix || "-";
        } else {
            // Check if we can infer from image frame name if strictly just an image
            // Fallback for now just set image by setting enFrame/frame
            appState.frame = imgData.frame;
            appState.enFrame = imgData.frame;

            // Reset others
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
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-overlay" onclick={close}>
        <div
            class="modal-content modal-char"
            onclick={(e) => e.stopPropagation()}
        >
            <div class="modal-header">
                <h3>ВЫБОР ПЕРСОНАЖА</h3>
                <button class="modal-close" onclick={close}>X</button>
            </div>
            <input
                type="text"
                class="modal-search"
                bind:value={searchQuery}
                placeholder="ПОИСК..."
                bind:this={searchInput}
            />

            <div class="modal-grid">
                {#each charList as char}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                        class="modal-item"
                        onclick={() => selectCharacter(char)}
                    >
                        <img src={char.file} alt={char.frame} loading="lazy" />
                        <span>{char.label}</span>
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}
