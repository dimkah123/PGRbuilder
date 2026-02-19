<script>
    import { appState } from "$lib/state.svelte.js";
    import { t } from "$lib/i18n.js";
    import { fade, fly } from "svelte/transition";
    import { onMount } from "svelte";
    import LoadingScreen from "../LoadingScreen.svelte"; // Reusing or just simple loading

    export function open() {
        isOpen = true;
        fetchBuilds();
    }

    export function close() {
        isOpen = false;
    }

    let isOpen = $state(false);
    let builds = $state([]);
    let isLoading = $state(false);
    let error = $state(null);

    async function fetchBuilds() {
        if (!appState.userToken) return;
        isLoading = true;
        error = null;
        try {
            const res = await fetch("/api/my-builds", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ googleToken: appState.userToken }),
            });
            if (res.ok) {
                const data = await res.json();
                builds = data.builds || [];
            } else {
                error = "Failed to load builds";
            }
        } catch (e) {
            error = e.message;
        } finally {
            isLoading = false;
        }
    }

    function loadBuild(shortId) {
        // Redirect to load the build
        // Use full reload to ensure clean state or use router if enabled
        window.location.href = `/?id=${shortId}`;
    }

    async function deleteBuild(shortId, event) {
        event.stopPropagation();
        if (!confirm(t("delete_confirm"))) return;

        try {
            const res = await fetch("/api/delete-build", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shortId,
                    googleToken: appState.userToken,
                }),
            });

            if (res.ok) {
                // Remove from list immediately
                builds = builds.filter((b) => b.shortId !== shortId);
            } else {
                const data = await res.json();
                alert("Error: " + (data.error || "Failed to delete"));
            }
        } catch (e) {
            console.error(e);
            alert("Error: " + e.message);
        }
    }

    // Google Logout
    function logout() {
        // Revoke if needed, or just clear state
        /* global google */
        if (typeof google !== "undefined") {
            google.accounts.id.disableAutoSelect();
        }
        appState.userToken = null;
        appState.userProfile = null; // Clear profile data
        close();
    }
</script>

{#if isOpen}
    <div
        class="modal-backdrop"
        role="button"
        tabindex="0"
        onclick={(e) => {
            if (e.target === e.currentTarget) close();
        }}
        onkeydown={(e) => e.key === "Escape" && close()}
        transition:fade={{ duration: 300 }}
    >
        <div
            class="modal-content"
            role="document"
            in:fly={{ y: 20, duration: 300 }}
            out:fly={{ y: 20, duration: 200 }}
        >
            <div class="modal-header">
                <h2>{t("user_profile") || "User Profile"}</h2>
                <button class="close-btn" onclick={close}>&times;</button>
            </div>

            <div class="modal-body">
                {#if appState.userProfile}
                    <div class="profile-info">
                        <img
                            src={appState.userProfile.picture}
                            alt="Avatar"
                            class="avatar-large"
                        />
                        <div class="profile-details">
                            <span class="profile-name"
                                >{appState.userProfile.name}</span
                            >
                            <span class="profile-email"
                                >{appState.userProfile.email}</span
                            >
                            <button class="btn btn-logout" onclick={logout}
                                >{t("logout")}</button
                            >
                        </div>
                    </div>
                {/if}

                <div class="builds-list-container">
                    <h3>{t("my_builds")}</h3>
                    {#if isLoading}
                        <div class="loading">
                            {t("loading")}
                        </div>
                    {:else if error}
                        <div class="error">{error}</div>
                    {:else if builds.length === 0}
                        <div class="empty">
                            {t("no_builds")}
                        </div>
                    {:else}
                        <div class="builds-list">
                            {#each builds as build}
                                <div class="build-item">
                                    <button
                                        class="build-info-btn"
                                        onclick={() => loadBuild(build.shortId)}
                                    >
                                        <span class="build-title"
                                            >{build.title || "Untitled"}</span
                                        >
                                        <span class="build-id"
                                            >ID: {build.shortId}</span
                                        >
                                    </button>
                                    <button
                                        class="delete-btn"
                                        onclick={(e) =>
                                            deleteBuild(build.shortId, e)}
                                        title="Delete Build"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        /* backdrop-filter: blur(5px); Removed for performance */
    }

    .modal-content {
        background: rgba(20, 20, 20, 0.95);
        border: 1px solid #444;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        color: #fff;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #333;
        background: rgba(30, 30, 30, 0.5);
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.2rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .close-btn {
        background: none;
        border: none;
        color: #888;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }

    .close-btn:hover {
        color: #fff;
    }

    .modal-body {
        padding: 20px;
        overflow-y: auto;
    }

    .profile-info {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid #333;
    }

    .avatar-large {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        border: 2px solid #555;
    }

    .profile-details {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .profile-name {
        font-size: 1.1rem;
        font-weight: bold;
    }

    .profile-email {
        font-size: 0.9rem;
        color: #aaa;
    }

    .btn-logout {
        margin-top: 5px;
        align-self: flex-start;
        padding: 5px 10px;
        font-size: 0.8rem;
        background: #333;
        border: 1px solid #555;
        color: #fff;
        cursor: pointer;
    }

    .btn-logout:hover {
        background: #444;
        border-color: #777;
    }

    .builds-list-container h3 {
        margin: 0 0 15px 0;
        font-size: 1rem;
        color: #ddd;
    }

    .builds-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .build-item {
        background: rgba(40, 40, 40, 0.5);
        border: 1px solid #333;
        /* padding: 10px; removed padding here, added to children */
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        color: inherit;
        font-family: inherit;
        font-size: inherit;
        transition: border-color 0.2s;
    }

    .build-item:hover {
        border-color: var(--accent-red, #f00);
        background: rgba(60, 60, 60, 0.8);
    }

    .build-info-btn {
        flex-grow: 1;
        background: transparent;
        border: none;
        padding: 10px;
        text-align: left;
        cursor: pointer;
        color: inherit;
        display: flex;
        flex-direction: column;
    }

    .delete-btn {
        background: transparent;
        border: none;
        font-size: 1.2rem;
        padding: 10px 15px;
        cursor: pointer;
        opacity: 0.5;
        transition:
            opacity 0.2s,
            color 0.2s;
    }

    .delete-btn:hover {
        opacity: 1;
        color: #f55;
    }

    .build-title {
        font-weight: bold;
    }

    .build-id {
        font-family: monospace;
        color: #888;
        font-size: 0.8rem;
    }

    .empty,
    .loading,
    .error {
        text-align: center;
        padding: 20px;
        color: #888;
    }

    .error {
        color: #f55;
    }
</style>
