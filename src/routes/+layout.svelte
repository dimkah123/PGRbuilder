<script>
    import "$lib/styles/fonts.css";
    import "$lib/styles/globals.css";
    import "$lib/styles/layout.css";
    import "$lib/styles/character.css";
    import "$lib/styles/builds.css";
    import "$lib/styles/components.css";
    import "$lib/styles/themes.css";
    import "$lib/styles/responsive.css";
    import LoadingScreen from "$lib/components/LoadingScreen.svelte";
    import { Analytics } from "@vercel/analytics/sveltekit";
</script>

<Analytics />
<LoadingScreen />
<slot />
