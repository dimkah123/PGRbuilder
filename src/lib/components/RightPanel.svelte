<script>
    import { appState } from "$lib/state.svelte.js";
    import BuildList from "./BuildList.svelte";
</script>

<div class="right-panel {appState.char ? '' : 'ui-locked'}">
    <div class="section-header">
        <span>КОНФИГУРАЦИЯ ПАМЯТИ</span>
    </div>

    <BuildList />

    <div class="add-build-area">
        <button
            id="add-build-btn-wide"
            class="add-build-wide-btn"
            onclick={() => appState.addBuild()}
        >
            + ДОБАВИТЬ СЕТ
        </button>
    </div>
</div>

<style>
    .right-panel {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    .section-header {
        font-family: var(--font-header);
        font-size: 1.2rem;
        color: var(--text-highlight);
        border-bottom: 1px solid #333;
        padding-bottom: 5px;
        letter-spacing: 2px;
    }
    .add-build-area {
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }
    .add-build-wide-btn {
        width: 100%;
        padding: 15px;
        background: transparent;
        border: 1px dashed #333;
        color: #666;
        font-family: var(--font-header);
        font-size: 1rem;
        cursor: pointer;
        transition: 0.2s;
        letter-spacing: 2px;
    }
    .add-build-wide-btn:hover {
        border-color: var(--accent-red);
        color: var(--accent-red);
        background: rgba(255, 51, 51, 0.05);
    }
</style>
