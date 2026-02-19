<script>
    import { appState } from "$lib/state.svelte.js";
    import { t } from "$lib/i18n.js";
    import { fade } from "svelte/transition";

    import { onMount } from "svelte";

    let {
        onSave,
        onExport,
        onGuide,
        onSettings,
        onToggleTheme,
        onProfile, // New prop
        isLightMode,
        saveBtnState,
    } = $props();

    let isToolsOpen = $state(false);
    let googleReady = $state(false);

    function loadGoogleLibrary() {
        // Remove existing script if any
        const existingScript = document.getElementById("google-gsi-script");
        if (existingScript) existingScript.remove();

        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = `https://accounts.google.com/gsi/client?hl=${appState.lang}`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            /* global google */
            google.accounts.id.initialize({
                client_id:
                    "64823134414-44hmn7s4ro6bhdu9ub82a5gi092pq0nj.apps.googleusercontent.com",
                callback: handleCredentialResponse,
            });
            googleReady = true;
        };
        document.head.appendChild(script);
    }

    $effect(() => {
        // Reload Google Library when language changes
        const l = appState.lang; // Dependency
        if (typeof window !== "undefined") {
            googleReady = false; // Reset readiness
            loadGoogleLibrary();
        }
    });

    function handleCredentialResponse(response) {
        console.log("Encoded JWT ID token: " + response.credential);
        appState.userToken = response.credential;

        // Decode Token
        try {
            const payload = JSON.parse(atob(response.credential.split(".")[1]));
            appState.userProfile = {
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                id: payload.sub,
            };

            // Persist
            localStorage.setItem("pgr_user_token", appState.userToken);
            localStorage.setItem(
                "pgr_user_profile",
                JSON.stringify(appState.userProfile),
            );
        } catch (e) {
            console.error("Failed to decode token", e);
        }
    }

    function googleSignin(node) {
        $effect(() => {
            if (googleReady && !appState.userToken) {
                try {
                    // Slight delay to ensure library is fully ready after load
                    setTimeout(() => {
                        if (typeof google === "undefined") return;
                        google.accounts.id.renderButton(node, {
                            theme: "filled_black",
                            size: "medium",
                            type: "standard",
                            shape: "pill",
                        });
                    }, 50);
                } catch (e) {
                    console.error("Google Sign-In render error", e);
                }
            }
        });
    }

    function handleToolClick(action) {
        action();
        isToolsOpen = false;
    }
</script>

<div class="top-nav">
    <div class="nav-left">
        <span>{t("system_database")}</span>
        {#key appState.lang}
            <span class="desktop-status-text" in:fade={{ duration: 300 }}>
                // {t("build_constructor")}</span
            >
        {/key}
    </div>
    <div class="nav-right">
        <!-- Desktop Actions -->
        <div class="desktop-actions">
            <button
                class="btn nav-btn {saveBtnState.style === 'update'
                    ? 'btn-update'
                    : ''}"
                onclick={onSave}
            >
                {#key appState.lang}
                    <span in:fade={{ duration: 300 }}
                        >{t(saveBtnState.textKey)}</span
                    >
                {/key}
            </button>
            <button class="btn nav-btn" onclick={onExport}>
                {#key appState.lang}
                    <span in:fade={{ duration: 300 }}>{t("save_png")}</span>
                {/key}
            </button>
            <button class="btn nav-btn" onclick={onGuide}>
                {#key appState.lang}
                    <span in:fade={{ duration: 300 }}>{t("guide")}</span>
                {/key}
            </button>
            <button class="btn nav-btn" onclick={onSettings}>
                {#key appState.lang}
                    <span in:fade={{ duration: 300 }}>{t("settings")}</span>
                {/key}
            </button>
        </div>

        <div class="nav-separator"></div>

        <!-- Language Switcher -->
        <button
            class="btn lang-toggle toggle-btn"
            onclick={() => appState.toggleLanguage()}
            title={t("language")}
        >
            {appState.lang.toUpperCase()}
        </button>

        <!-- Login / Profile (Moved) -->
        {#if appState.userToken && appState.userProfile}
            <button
                class="avatar-btn"
                onclick={onProfile}
                title={appState.userProfile.name}
                style="margin-left: 10px;"
            >
                <img
                    src={appState.userProfile.picture}
                    alt="Avatar"
                    class="nav-avatar"
                />
            </button>
        {:else}
            <div
                use:googleSignin
                style="height: 40px; display: flex; align-items: center; margin-left: 10px;"
            ></div>
        {/if}

        <!-- Mobile Tools Menu -->
        <div class="mobile-tools-container">
            <button
                class="btn tools-toggle"
                onclick={() => (isToolsOpen = !isToolsOpen)}
            >
                {#key appState.lang}
                    <span in:fade={{ duration: 300 }}>{t("tools")}</span>
                {/key}
            </button>
            {#if isToolsOpen}
                <div class="tools-dropdown">
                    <button onclick={() => handleToolClick(onSave)}
                        >{t("create_link")}</button
                    >
                    {#if appState.userToken && appState.userProfile}
                        <button onclick={() => handleToolClick(onProfile)}
                            >{t("profile") || "Profile"}</button
                        >
                    {:else}
                        <div
                            use:googleSignin
                            style="height: 40px; display: flex; align-items: center; justify-content: center; padding: 5px;"
                        ></div>
                    {/if}
                    <button onclick={() => handleToolClick(onToggleTheme)}>
                        {isLightMode ? t("dark_mode") : t("light_mode")}
                    </button>
                    <button onclick={() => handleToolClick(onExport)}
                        >{t("save_png")}</button
                    >
                    <button onclick={() => handleToolClick(onGuide)}
                        >{t("guide")}</button
                    >
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .mobile-tools-container {
        position: relative;
        display: none; /* Hidden by default (Desktop) */
    }

    .tools-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: #000;
        border: 1px solid #333;
        display: flex;
        flex-direction: column;
        width: 150px;
        z-index: 1000;
        margin-top: 5px;
    }

    .tools-dropdown button {
        background: transparent;
        border: none;
        border-bottom: 1px solid #222;
        color: #ccc;
        padding: 10px;
        text-align: left;
        font-family: inherit;
        font-size: 0.75rem;
        cursor: pointer;
    }

    .tools-dropdown button:last-child {
        border-bottom: none;
    }

    .tools-dropdown button:hover {
        background: #111;
        color: #fff;
    }

    /* Mobile Styles */
    @media screen and (max-width: 1024px) {
        .mobile-tools-container {
            display: block;
        }
    }

    .desktop-status-text {
        color: #fff;
    }

    .toggle-btn {
        padding: 5px 10px;
        font-size: 0.7rem;
        cursor: pointer;
        text-transform: uppercase;
        border: 1px solid #444;
        transition: all 0.2s ease;
    }

    .lang-toggle {
        min-width: 45px;
        background: #000;
        color: #fff;
    }

    /* Keep theme toggle consistent with mode */
    :global(.light-theme) .lang-toggle {
        background: #fff;
        color: #000;
    }

    .toggle-btn:hover,
    .tools-toggle:hover,
    .nav-btn:hover {
        border-color: var(--accent-red);
        color: var(--accent-red);
    }

    .desktop-actions {
        display: flex;
        gap: 10px;
    }

    .nav-btn {
        padding: 5px 15px;
        font-size: 0.75rem;
    }

    .nav-separator {
        width: 1px;
        height: 24px;
        background: #333;
        margin: 0 10px;
    }

    /* Hide desktop actions on mobile */
    @media screen and (max-width: 1024px) {
        .desktop-actions,
        .nav-separator {
            display: none;
        }
    }
    .avatar-btn {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        border-radius: 50%;
        transition: transform 0.2s;
    }

    .avatar-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 0 10px var(--accent-red);
    }

    .nav-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid #555;
    }
</style>
