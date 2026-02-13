<script>
    import { onMount } from "svelte";

    let { value = $bindable("") } = $props();

    let isOpen = $state(false);
    let triggerRef;

    const OPTIONS = [
        { val: "", label: "—" },
        { val: "1", label: "1x" },
        { val: "2", label: "2x" },
        { val: "3", label: "3x" },
        { val: "4", label: "4x" },
        { val: "5", label: "5x" },
        { val: "6", label: "6x" },
    ];

    function toggle(e) {
        e.stopPropagation();
        isOpen = !isOpen;
    }

    function select(val) {
        value = val;
        isOpen = false;
    }

    function handleClickOutside(event) {
        if (isOpen && triggerRef && !triggerRef.contains(event.target)) {
            isOpen = false;
        }
    }

    onMount(() => {
        window.addEventListener("click", handleClickOutside);
        return () => {
            window.removeEventListener("click", handleClickOutside);
        };
    });

    // Determine label
    let currentLabel = $derived(
        OPTIONS.find((o) => o.val === value)?.label || "—",
    );
</script>

<div
    class="custom-res-select {isOpen ? 'open' : ''}"
    role="button"
    tabindex="0"
    onclick={toggle}
    onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") toggle(e);
    }}
    bind:this={triggerRef}
>
    <div class="res-select-trigger">
        {currentLabel}
    </div>
    <div class="res-select-options">
        {#each OPTIONS as opt}
            <div
                class="res-select-option {value === opt.val ? 'selected' : ''}"
                role="option"
                aria-selected={value === opt.val}
                tabindex="0"
                onclick={(e) => {
                    e.stopPropagation();
                    select(opt.val);
                }}
                onkeydown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        select(opt.val);
                    }
                }}
            >
                {opt.label}
            </div>
        {/each}
    </div>
</div>
