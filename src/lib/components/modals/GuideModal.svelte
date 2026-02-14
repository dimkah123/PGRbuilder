<script>
    import { t } from "$lib/i18n.js";
    import { fade, scale } from "svelte/transition";

    let isOpen = $state(false);

    export function open() {
        isOpen = true;
    }

    function close() {
        isOpen = false;
    }
</script>

{#if isOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
    <div
        class="modal-overlay"
        onclick={(e) => e.target === e.currentTarget && close()}
        role="dialog"
        tabindex="-1"
        aria-modal="true"
        transition:fade={{ duration: 200 }}
    >
        <div
            class="modal-content guide-modal"
            transition:scale={{ duration: 200, start: 0.95 }}
        >
            <div class="modal-header">
                <h3>{t("guide_title")}</h3>
                <button class="modal-close" onclick={close}>X</button>
            </div>

            <div class="guide-body">
                <div class="guide-item">
                    <h4>{t("guide_autocomplete_title")}</h4>
                    <p>{t("guide_autocomplete_desc")}</p>
                </div>

                <div class="guide-item">
                    <h4>{t("guide_highlight_title")}</h4>
                    <p>{t("guide_highlight_desc")}</p>
                </div>

                <div class="guide-item">
                    <h4>{t("guide_editing_title")}</h4>
                    <p>{t("guide_editing_desc")}</p>
                </div>
            </div>

            <div class="guide-footer">
                <button class="btn close-btn" onclick={close}
                    >{t("close")}</button
                >
            </div>
        </div>
    </div>
{/if}

<style>
    .guide-modal {
        width: 500px;
        max-width: 90%;
        background: var(--panel-bg);
        border: 1px solid var(--accent-red);
        box-shadow:
            0 0 30px rgba(0, 0, 0, 0.8),
            0 0 10px rgba(255, 60, 60, 0.2);
        display: flex;
        flex-direction: column;
    }

    .guide-body {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        color: var(--text-color);
        max-height: 60vh;
        overflow-y: auto;
    }

    .guide-item {
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .guide-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    h4 {
        color: var(--accent-red);
        font-family: var(--font-header);
        margin-bottom: 8px;
        font-size: 1rem;
        letter-spacing: 1px;
    }

    p {
        font-family: var(--font-body);
        font-size: 0.9rem;
        line-height: 1.5;
        color: #bbb;
    }

    .guide-footer {
        padding: 15px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: flex-end;
    }

    .close-btn {
        min-width: 100px;
        border-color: var(--accent-red);
        color: var(--accent-red);
        border: 1px solid var(--accent-red);
        background: transparent;
        padding: 8px 16px;
        cursor: pointer;
        font-family: var(--font-tech);
        transition: all 0.2s;
    }

    .close-btn:hover {
        background: var(--accent-red);
        color: #fff;
    }
</style>
