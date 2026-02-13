<script>
    import { appState } from "$lib/state.svelte.js";
    import BuildRow from "./BuildRow.svelte";
    import { fly, slide } from "svelte/transition";
    import { quintOut } from "svelte/easing";
</script>

<div id="builds-container">
    {#each appState.builds as build, index (build)}
        <div
            in:fly={{ y: -20, duration: 300, easing: quintOut }}
            out:slide={{ duration: 300, easing: quintOut }}
        >
            <BuildRow {build} {index} />
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
