<script>
    import { appState } from "$lib/state.svelte.js";
    import BuildRow from "./BuildRow.svelte";
</script>

<div id="builds-container">
    {#each appState.builds as build, index (build)}
        <div>
            <BuildRow {build} {index} isLoading={appState.isLoading} />
        </div>
    {/each}
</div>

<style>
    #builds-container {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
</style>
