<script>
    import { appState } from "$lib/state.svelte.js";
    import { fade } from "svelte/transition";
    import { page } from "$app/stores";
</script>

{#if appState.isInitialLoad && $page.url.pathname === "/"}
    <div id="loading-overlay" transition:fade={{ duration: 300 }}>
        <div class="spinner"></div>
        <div class="loading-text">INITIALIZING SYSTEMS...</div>
    </div>
{/if}

<style>
    #loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .spinner {
        width: 60px;
        height: 60px;
        border: 3px solid rgba(255, 51, 51, 0.2);
        border-radius: 50%;
        border-top-color: var(--accent-red);
        animation: spin 1s ease-in-out infinite;
        margin-bottom: 20px;
        box-shadow: 0 0 15px rgba(255, 51, 51, 0.1);
        flex-shrink: 0;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .loading-text {
        font-family: var(--font-header);
        color: var(--accent-red);
        letter-spacing: 4px;
        font-size: 0.9rem;
        animation: blink 2s infinite;
        text-shadow: 0 0 5px rgba(255, 51, 51, 0.5);
        min-height: 1.2em;
        text-align: center;
    }

    @keyframes blink {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.4;
        }
    }
</style>
