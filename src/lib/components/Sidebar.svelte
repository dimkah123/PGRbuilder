<script>
    import { t } from "$lib/i18n.js";
    import { page } from "$app/stores";

    // Determine current page
    let currentPath = $derived($page.url.pathname);

    // Mobile sidebar open state
    let { open = $bindable(false) } = $props();

    function close() {
        open = false;
    }

    // Settings dropdown
    let settingsOpen = $state(false);
    let isLightMode = $state(false);

    function toggleTheme() {
        isLightMode = !isLightMode;
        document.body.classList.toggle("light-theme", isLightMode);
    }
</script>

<!-- Mobile overlay backdrop -->
{#if open}
    <div class="sidebar-backdrop" onclick={close} role="presentation"></div>
{/if}

<aside class="sidebar" class:sidebar--open={open}>
    <!-- Close button, visible on mobile only -->
    <button
        class="sidebar-close-btn"
        onclick={close}
        aria-label="Close navigation"
    >
        ✕
    </button>
    <a
        href="/main"
        class="nav-item"
        class:active={currentPath === "/main"}
        onclick={close}
    >
        <svg class="nav-icon" viewBox="0 0 24 24">
            <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
        </svg>
        <span class="nav-text">{t("nav_constructs")}</span>
    </a>
    <a
        href="/"
        class="nav-item"
        class:active={currentPath === "/"}
        onclick={close}
    >
        <svg class="nav-icon" viewBox="0 0 24 24">
            <path
                d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"
            />
        </svg>
        <span class="nav-text">{t("nav_builds")}</span>
    </a>
    <div class="settings-wrapper">
        <button class="nav-item" onclick={() => (settingsOpen = !settingsOpen)}>
            <svg class="nav-icon" viewBox="0 0 24 24">
                <path
                    d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"
                />
            </svg>
            <span class="nav-text">{t("nav_settings")}</span>
        </button>

        {#if settingsOpen}
            <div class="settings-dropdown">
                <button class="settings-opt" onclick={toggleTheme}>
                    <svg viewBox="0 0 24 24" class="opt-icon">
                        <path
                            d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .38-.39.38-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.38.39-1.02 0-1.41l-1.06-1.06zm1.06-12.37l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41-.38-.39-1.02-.39-1.41 0zM7.05 18.36l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41-.39-.38-1.03-.38-1.41 0z"
                        />
                    </svg>
                    {isLightMode
                        ? t("dark_mode") || "Тёмная тема"
                        : t("light_mode") || "Белая тема"}
                </button>
            </div>
        {/if}
    </div>
</aside>

<style>
    .sidebar {
        width: 80px;
        min-width: 80px;
        height: 100%;
        background-color: var(--panel-bg);
        border-right: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        padding: 20px 0;
        /* transitions for mobile slide */
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 200;
        position: relative;
    }

    /* Settings wrapper pushed to the very bottom */
    .settings-wrapper {
        margin-top: auto;
        position: relative;
        width: 100%;
    }

    /* Dropdown opens to the right from the settings button */
    .settings-dropdown {
        position: absolute;
        bottom: 0;
        left: 100%;
        width: 160px;
        background: #0a0a0a;
        border: 1px solid var(--border-color);
        box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        z-index: 300;
    }

    .settings-opt {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 14px;
        background: transparent;
        border: none;
        border-bottom: 1px solid #1a1a1a;
        color: var(--text-dim);
        font-size: 11px;
        font-family: var(--font-header);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        cursor: pointer;
        text-align: left;
        width: 100%;
        transition:
            background 0.2s,
            color 0.2s;
    }

    .settings-opt:last-child {
        border-bottom: none;
    }

    .settings-opt:hover {
        background: #1a1a1a;
        color: var(--accent-red);
    }

    .opt-icon {
        width: 16px;
        height: 16px;
        fill: currentColor;
        flex-shrink: 0;
    }

    .nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 15px 5px;
        cursor: pointer;
        transition: background-color 0.2s;
        text-decoration: none;
        gap: 8px;
        background: transparent;
        border: none;
        width: 100%;
        color: inherit;
        font-family: inherit;
    }

    .nav-item:hover {
        background-color: #1a1a1a;
    }

    .nav-item.active {
        background-color: #1a1a1a;
        border-left: 2px solid var(--accent-red);
    }

    .nav-icon {
        width: 24px;
        height: 24px;
        fill: var(--text-dim);
        transition: fill 0.2s;
    }

    .nav-text {
        font-size: 10px;
        font-weight: bold;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: color 0.2s;
        text-align: center;
    }

    .nav-item:hover .nav-icon,
    .nav-item.active .nav-icon {
        fill: var(--accent-red);
    }

    .nav-item:hover .nav-text,
    .nav-item.active .nav-text {
        color: var(--accent-red);
    }

    /* ─── Close button (hidden on desktop, shown on mobile) ─── */
    .sidebar-close-btn {
        display: none;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 48px; /* match mobile header height */
        width: 100%;
        background: transparent;
        border: none;
        border-bottom: 1px solid var(--border-color);
        color: var(--text-dim);
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        flex-shrink: 0;
        transition:
            color 0.2s,
            background 0.2s;
        font-family: inherit;
    }

    .sidebar-close-btn:hover {
        color: var(--accent-red);
        background: #1a1a1a;
    }

    /* ─── Mobile ─── */
    @media (max-width: 768px) {
        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 90px; /* = 1 roster column */
            min-width: 90px;
            height: 100dvh;
            transform: translateX(-100%);
            padding-top: 48px; /* leave room for the close button */
        }

        .sidebar--open {
            transform: translateX(0);
        }

        .sidebar-backdrop {
            display: block;
        }

        .sidebar-close-btn {
            display: flex;
        }
    }

    .sidebar-backdrop {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 199;
        backdrop-filter: blur(2px);
        animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>
