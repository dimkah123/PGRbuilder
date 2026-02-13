<script>
    import { appState } from "$lib/state.svelte.js";
    import { WEAPON_RESONANCES, CLASS_TO_PREFIX } from "$lib/data.js";

    // Derived filtering logic
    let availableResonances = $derived.by(() => {
        const charClass = appState.class || "";
        const prefix = CLASS_TO_PREFIX[charClass];

        return WEAPON_RESONANCES.filter((res) => {
            if (res.prefix === "UN") return true;
            if (!prefix) return true; // Show all if no class
            if (prefix === "UNI") return true; // Vanguard gets all? Legacy said: UNI = Vanguard only... Wait.
            // Legacy check:
            // if (res.prefix === 'UN') return true;
            // if (!charClass) return true;
            // if (charClass === 'UNI') return true; // THIS IS WRONG in legacy logic naming?
            // Legacy: if (charClass === 'UNI') return true; means "If character is Vanguard/UNI, show everything".
            // But UNI prefix is explicitly for Vanguard.
            // Let's stick to legacy logic:
            // res.prefix === charClass (which is mapped prefix) OR res.prefix === 'UN'

            return res.prefix === prefix;
        });
    });

    // We also need to know which resonances are ALREADY used in this build to disable them
    // appState.builds[buildIndex].wRes (we need to add this property to build object if not exist)
    // Wait, createBuild() didn't have wRes array. I should add it.

    function selectResonance(res) {
        if (appState.modalData) {
            const { buildIndex, slotIndex } = appState.modalData;
            if (buildIndex !== undefined && slotIndex !== undefined) {
                // We need to store weapon resonances in build.
                // Let's assume build.wRes = [null, null, null]
                if (!appState.builds[buildIndex].wRes)
                    appState.builds[buildIndex].wRes = [null, null, null];
                appState.builds[buildIndex].wRes[slotIndex] = res;
            }
        }
        appState.closeModal();
    }

    function close() {
        appState.closeModal();
    }
</script>

{#if appState.activeModal === "wres"}
    <div
        class="modal-overlay"
        onclick={(e) => e.target === e.currentTarget && close()}
        onkeydown={(e) => e.key === "Escape" && close()}
        role="button"
        tabindex="-1"
        aria-label="Close modal"
    >
        <div
            class="wres-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabindex="-1"
        >
            <div class="modal-header">
                <h3 id="modal-title">{t("weapon_res_selection")}</h3>
                <button class="modal-close" onclick={close}>X</button>
            </div>

            <div class="wres-grid">
                {#each availableResonances as res}
                    <div
                        class="wres-item"
                        onclick={() => selectResonance(res)}
                        onkeydown={(e) =>
                            (e.key === "Enter" || e.key === " ") &&
                            selectResonance(res)}
                        role="button"
                        tabindex="0"
                    >
                        <img src={res.file} alt={res.name} />
                        <span>{res.name}</span>
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}
