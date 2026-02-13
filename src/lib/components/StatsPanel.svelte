<script>
    import { appState } from "$lib/state.svelte.js";
    import Combobox from "./ui/Combobox.svelte";
    import { WEAPON_IMAGES, CUB_IMAGES } from "$lib/data.js";

    // Options
    const CLASS_OPTIONS = [
        "Атакующий",
        "Поддержка",
        "Танк",
        "Авангард",
        "Амплифаер",
        "Унифрейм",
    ];

    const ELEMENT_OPTIONS = ["Физический", "Огонь", "Лед", "Молния", "Тьма"];

    const RANK_OPTIONS = ["B", "A", "S", "SS", "SSS", "SSS+"];

    // Element + loose affixes
    const AFFIX_OPTIONS = [
        ...ELEMENT_OPTIONS,
        "Burn",
        "Dark",
        "Fire",
        "Freez",
        "Light",
        "Nihl",
        "Phys",
        "Plasma",
        "Slash",
        "Thunder",
        "Umbra",
    ];

    const WEAPON_OPTIONS = Object.keys(WEAPON_IMAGES).sort();
    const CUB_OPTIONS = Object.keys(CUB_IMAGES).sort();
</script>

<div class="stats-container {appState.char ? '' : 'ui-locked'}">
    <!-- Row 1: Main Stats -->
    <div class="stats-row main-stats-row">
        <!-- Class -->
        <div class="stat-box">
            <span class="stat-label">КЛАСС</span>
            {#if appState.classImg}
                <img
                    class="stat-icon"
                    src={appState.classImg}
                    width="60"
                    height="60"
                    alt="Class"
                />
            {/if}
            <div class="combobox-container">
                <Combobox
                    name="char-class"
                    class="stat-input"
                    bind:value={appState.class}
                    placeholder="-"
                    options={CLASS_OPTIONS}
                />
            </div>
        </div>
        <!-- Element -->
        <div class="stat-box">
            <span class="stat-label">СТИХИЯ</span>
            {#if appState.elementImg}
                <img
                    class="stat-icon"
                    src={appState.elementImg}
                    width="60"
                    height="60"
                    alt="Element"
                />
            {/if}
            <div class="combobox-container">
                <Combobox
                    name="char-element"
                    class="stat-input"
                    bind:value={appState.element}
                    placeholder="-"
                    options={ELEMENT_OPTIONS}
                />
            </div>
        </div>
        <!-- Weapon -->
        <div class="stat-box">
            <span class="stat-label">ОРУЖИЕ</span>
            {#if appState.weaponImg}
                <img
                    id="weapon-img"
                    class="stat-icon"
                    src={appState.weaponImg}
                    width="60"
                    height="60"
                    alt="Weapon"
                />
            {/if}
            <div class="combobox-container">
                <Combobox
                    name="char-weapon"
                    class="stat-input"
                    bind:value={appState.weapon}
                    placeholder="-"
                    options={WEAPON_OPTIONS}
                    onSelect={(opt) => {
                        // If selecting a real weapon name, we might want to store it in weaponReal
                        // But appState logic currently uses weapon as fallback.
                        // For now just binding value is enough to show image if it matches.
                    }}
                />
            </div>
        </div>
    </div>

    <!-- Row 2: Extra Data -->
    <div class="stats-row">
        <!-- Affix -->
        <div class="stat-box">
            <span class="stat-label">АФФИКС</span>
            {#if appState.affixImg}
                <img
                    id="affix-img"
                    class="stat-icon"
                    src={appState.affixImg}
                    width="60"
                    height="60"
                    alt="Affix"
                />
            {/if}
            <div class="combobox-container">
                <Combobox
                    name="char-affix"
                    class="stat-input"
                    bind:value={appState.affix}
                    placeholder="-"
                    options={AFFIX_OPTIONS}
                />
            </div>
        </div>
        <!-- Pet/CUB -->
        <div class="stat-box">
            <span class="stat-label">ПИТОМЕЦ / CUB</span>
            {#if appState.cubImg}
                <img
                    id="cub-img"
                    class="stat-icon"
                    src={appState.cubImg}
                    width="60"
                    height="60"
                    alt="CUB"
                />
            {/if}
            <div class="combobox-container">
                <Combobox
                    name="char-cub"
                    class="stat-input"
                    bind:value={appState.cub}
                    placeholder="-"
                    options={CUB_OPTIONS}
                />
            </div>
        </div>
        <!-- Rank -->
        <div class="stat-box rank-box">
            <span class="stat-label">РАНГ</span>
            <div class="combobox-container">
                <Combobox
                    name="char-rank"
                    class="stat-input rank-input"
                    bind:value={appState.rank}
                    placeholder="-"
                    options={RANK_OPTIONS}
                />
            </div>
        </div>
    </div>
</div>

<style>
    .combobox-container {
        width: 100%;
        position: relative;
    }

    /* Ensure stat-input style is preserved/passed down */
    /* Accessing global styles or pass-through classes */
</style>
