<script>
    let {
        value = $bindable(),
        placeholder = "",
        options = [],
        onSelect,
        showOnFocus = true,
        strict = false,
        class: className,
        id,
        name,
        ...rest
    } = $props();

    let isOpen = $state(false);
    let filteredOptions = $derived(
        options.filter((opt) => {
            const label = typeof opt === "string" ? opt : opt.label;
            return label.toLowerCase().includes((value || "").toLowerCase());
        }),
    );
    let selectedIndex = $state(-1);
    let inputElement;

    function handleInput(e) {
        value = e.target.value;
        if (!value && !showOnFocus) {
            isOpen = false;
        } else {
            isOpen = true;
        }
        selectedIndex = -1;
    }

    function handleKeydown(e) {
        if (!isOpen) {
            if (e.key === "ArrowDown" || e.key === "Enter") isOpen = true;
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % filteredOptions.length;
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            selectedIndex =
                (selectedIndex - 1 + filteredOptions.length) %
                filteredOptions.length;
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
                selectOption(filteredOptions[selectedIndex]);
            }
        } else if (e.key === "Escape") {
            isOpen = false;
        }
    }

    function selectOption(opt) {
        const val = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;

        value = val; // or label? usually value for input

        if (onSelect) {
            onSelect(opt);
        }
        isOpen = false;
    }

    function handleBlur() {
        // Delay hide to allow click
        setTimeout(() => {
            isOpen = false;

            if (strict && value) {
                const lowerVal = value.toLowerCase();
                const match = options.find((opt) => {
                    const optVal = typeof opt === "string" ? opt : opt.value;
                    return optVal.toLowerCase() === lowerVal;
                });

                if (match) {
                    const properVal =
                        typeof match === "string" ? match : match.value;
                    if (value !== properVal) value = properVal;
                } else {
                    value = "";
                }
            }
        }, 200);
    }

    function handleFocus() {
        if (showOnFocus) isOpen = true;
    }

    function handleClick() {
        if (showOnFocus) isOpen = true;
    }
    export function focus() {
        inputElement?.focus();
    }

    export function blur() {
        inputElement?.blur();
    }
</script>

<div class="combobox-wrapper">
    <input
        type="text"
        bind:this={inputElement}
        bind:value
        {placeholder}
        {id}
        {name}
        oninput={handleInput}
        onkeydown={handleKeydown}
        onblur={handleBlur}
        onfocus={handleFocus}
        onclick={handleClick}
        class={className}
        {...rest}
    />

    {#if isOpen && filteredOptions.length > 0}
        <div class="combobox-dropdown">
            {#each filteredOptions as opt, i}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="combobox-item {i === selectedIndex
                        ? 'selected'
                        : ''}"
                    onmousedown={(e) => {
                        e.preventDefault();
                        selectOption(opt);
                    }}
                >
                    {#if typeof opt === "string"}
                        {@html opt.replace(
                            new RegExp(`(${value})`, "gi"),
                            "<strong>$1</strong>",
                        )}
                    {:else}
                        {@html opt.label.replace(
                            new RegExp(`(${value})`, "gi"),
                            "<strong>$1</strong>",
                        )}
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .combobox-wrapper {
        position: relative;
        width: 100%;
    }
    .combobox-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        max-height: 200px;
        overflow-y: auto;
        background: #222;
        border: 1px solid #444;
        z-index: 1000;
        display: flex;
        flex-direction: column;
    }
    .combobox-item {
        padding: 8px 10px;
        cursor: pointer;
        border-bottom: 1px solid #333;
        font-size: 0.9rem;
        color: #ccc;
        text-align: left;
    }
    .combobox-item:hover,
    .combobox-item.selected {
        background: #333;
        color: var(--text-highlight, #fff);
    }
    .combobox-item:last-child {
        border-bottom: none;
    }

    /* Highlight style */
    :global(.combobox-item strong) {
        color: var(--accent-red);
        font-weight: bold;
    }
</style>
