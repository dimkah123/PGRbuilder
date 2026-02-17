<script>
    import { appState } from "$lib/state.svelte.js";
    import { WEAPON_RESONANCES, CLASS_TO_PREFIX } from "$lib/data.js";
    import { t } from "$lib/i18n.js";
    import { fade } from "svelte/transition";

    // Derived used names for easy lookup
    let usedNames = $derived.by(() => {
        const buildIndex = appState.modalData?.buildIndex;
        const currentBuild =
            buildIndex !== undefined ? appState.builds[buildIndex] : null;
        return (
            currentBuild?.wRes
                ?.filter((r) => r && typeof r === "object")
                .map((r) => r.name) || []
        );
    });

    // Derived filtering logic
    let availableResonances = $derived.by(() => {
        const charClass = appState.class || "";
        const prefix = CLASS_TO_PREFIX[charClass];

        return WEAPON_RESONANCES.filter((res) => {
            if (res.prefix === "UN") return true;
            if (!prefix) return true; // Show all if no class
            if (prefix === "UNI") return true;

            if (prefix === "BA") {
                return res.prefix === "AT" || res.prefix === "TA";
            }

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
                {#key appState.lang}
                    <h3 id="modal-title" in:fade={{ duration: 300 }}>
                        {t("weapon_res_selection")}
                    </h3>
                {/key}
                <button class="modal-close" onclick={close}>X</button>
            </div>

            <div class="wres-grid">
                {#each availableResonances as res}
                    {@const isUsed = usedNames.includes(res.name)}
                    <div
                        class="wres-item"
                        class:disabled={isUsed}
                        onclick={() => !isUsed && selectResonance(res)}
                        onkeydown={(e) =>
                            !isUsed &&
                            (e.key === "Enter" || e.key === " ") &&
                            selectResonance(res)}
                        role="button"
                        tabindex={isUsed ? -1 : 0}
                        aria-disabled={isUsed}
                    >
                        <img src={res.file} alt={res.name} />
                        <span>{res.name}</span>
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}
