<script>
    import { appState } from "$lib/state.svelte.js";
    import { t } from "$lib/i18n.js";
    import { fade, fly } from "svelte/transition";
    import { saveToCloud, getSaveButtonState } from "$lib/utils/cloud-save.js";

    let isOpen = $state(false);
    let buildName = $state("");
    let isSaving = $state(false);
    let saveStatus = $state(null); // { success: boolean, message: string }

    export function open() {
        isOpen = true;
        // Default to current title or generic
        buildName = appState.builds[0]?.title || `${appState.char} Build`;
        saveStatus = null;
    }

    export function close() {
        isOpen = false;
    }

    async function handleSave() {
        if (!buildName.trim()) return;

        isSaving = true;
        saveStatus = null;

        // Update title in state
        if (appState.builds.length > 0) {
            appState.builds[0].title = buildName.trim();
        }

        const result = await saveToCloud();

        isSaving = false;

        // saveToCloud handles alerts for now, but we can eventually move it here.
        // For now, if successful, close after a short delay
        if (result.success) {
            // Optional: Update UI button state globally if needed, done in +page.svelte usually
            // But we can construct the success message here if we refactor cloud-save.
            // For now, rely on cloud-save's internal alerts/clipboard logic.
            close();
        }
    }
</script>

{#if isOpen}
    <div
        class="modal-backdrop"
        role="button"
        tabindex="0"
        onclick={close}
        onkeydown={(e) => e.key === "Escape" && close()}
        transition:fade={{ duration: 300 }}
    >
        <div
            class="modal-content"
            role="document"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
            in:fly={{ y: 20, duration: 300 }}
            out:fly={{ y: 20, duration: 200 }}
        >
            <div class="modal-header">
                <h2>{t("save_build") || "Save Build"}</h2>
                <button class="close-btn" onclick={close}>&times;</button>
            </div>

            <div class="modal-body">
                <div class="preview-section">
                    {#if appState.charImg}
                        <img
                            src={appState.charImg}
                            alt="Character"
                            class="char-preview"
                        />
                    {/if}
                    <div class="char-info">
                        <span class="char-name"
                            >{appState.char || "Unknown Unit"}</span
                        >
                        <span class="char-frame">{appState.frame || ""}</span>
                    </div>
                </div>

                <div class="input-group">
                    <label for="build-name"
                        >{t("build_name") || "Build Name"}</label
                    >
                    <input
                        id="build-name"
                        type="text"
                        bind:value={buildName}
                        placeholder="Enter build name..."
                        onkeydown={(e) => e.key === "Enter" && handleSave()}
                        autofocus
                    />
                </div>

                {#if saveStatus}
                    <div class="status-msg" class:error={!saveStatus.success}>
                        {saveStatus.message}
                    </div>
                {/if}

                <div class="actions">
                    <button class="btn btn-cancel" onclick={close}
                        >{t("cancel") || "Cancel"}</button
                    >
                    <button
                        class="btn btn-save"
                        onclick={handleSave}
                        disabled={isSaving}
                    >
                        {#if isSaving}
                            {t("saving") || "Saving..."}
                        {:else}
                            {t("save") || "Save"}
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        backdrop-filter: blur(5px);
    }

    .modal-content {
        background: rgba(20, 20, 20, 0.95);
        border: 1px solid #444;
        width: 90%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        color: #fff;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #333;
        background: rgba(30, 30, 30, 0.5);
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.2rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .close-btn {
        background: none;
        border: none;
        color: #888;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }

    .close-btn:hover {
        color: #fff;
    }

    .modal-body {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .preview-section {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 10px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
    }

    .char-preview {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid #555;
    }

    .char-info {
        display: flex;
        flex-direction: column;
    }

    .char-name {
        font-weight: bold;
        color: #fff;
    }

    .char-frame {
        font-size: 0.8rem;
        color: #aaa;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .input-group label {
        font-size: 0.9rem;
        color: #ccc;
    }

    .input-group input {
        padding: 10px;
        background: #111;
        border: 1px solid #444;
        color: #fff;
        font-size: 1rem;
        border-radius: 4px;
        outline: none;
    }

    .input-group input:focus {
        border-color: var(--accent-red, #f00);
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 10px;
    }

    .btn {
        padding: 8px 20px;
        cursor: pointer;
        font-size: 0.9rem;
        border: 1px solid transparent;
        transition: all 0.2s;
    }

    .btn-cancel {
        background: transparent;
        color: #aaa;
        border-color: #444;
    }

    .btn-cancel:hover {
        color: #fff;
        border-color: #666;
    }

    .btn-save {
        background: var(--accent-red, #d32f2f);
        color: #fff;
    }

    .btn-save:hover {
        background: #b71c1c;
        transform: translateY(-1px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
