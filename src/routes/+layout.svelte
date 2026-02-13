<script>
    import "$lib/styles/globals.css";
    import "$lib/styles/layout.css";
    import "$lib/styles/character.css";
    import "$lib/styles/builds.css";
    import "$lib/styles/components.css";
    import "$lib/styles/themes.css";
    import "$lib/styles/responsive.css";
    import LoadingScreen from "$lib/components/LoadingScreen.svelte";
</script>

<LoadingScreen />
<slot />
