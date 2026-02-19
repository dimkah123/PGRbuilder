import { appState } from '$lib/state.svelte.js';
import { t } from '$lib/i18n.js';

const API_BASE = '/api';

function getEditToken(id) {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('edit_' + id);
}

function setEditToken(id, token) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('edit_' + id, token);
}

export async function saveToCloud() {
    // Button state handling should be done in UI component via state
    // We return promise/status

    const urlParams = new URLSearchParams(window.location.search);
    const existingId = urlParams.get('id');
    const existingToken = existingId ? getEditToken(existingId) : null;

    const isOwner = appState.userProfile && appState.loadedBuildOwner === appState.userProfile.id;

    try {
        if (existingId && (existingToken || isOwner)) {
            const updated = await updateBuild(existingId, existingToken);
            if (updated) {
                alert(t('msg_updated'));
                return { success: true, updated: true };
            } else {
                if (!confirm(t('msg_no_permission'))) {
                    return { success: false, reason: 'cancelled' };
                }
            }
        }

        const result = await createNewBuild();
        return { success: true, new: true, id: result.shortId };

    } catch (e) {
        console.error('Save Error:', e);
        alert(t('msg_save_error') + e.message);
        return { success: false, error: e.message };
    }
}

async function updateBuild(shortId, editToken) {
    const state = appState.serialize();
    const stateString = JSON.stringify(state);

    const response = await fetch(`${API_BASE}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            shortId: shortId,
            editToken: editToken, // Can be null if using googleToken
            data: stateString,
            googleToken: appState.userToken
        })
    });

    if (response.ok) return true;
    if (response.status === 403) return false;
    throw new Error('Update failed: ' + response.status);
}

async function createNewBuild() {
    const state = appState.serialize();
    const stateString = JSON.stringify(state);

    const response = await fetch(`${API_BASE}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            data: stateString,
            googleToken: appState.userToken
        })
    });

    if (!response.ok) throw new Error('Save failed: ' + response.status);

    const result = await response.json();
    setEditToken(result.shortId, result.editToken);
    appState.loadedBuildOwner = appState.userProfile?.id || null; // I am the owner now

    // Update URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('d');
    newUrl.searchParams.delete('data'); // Legacy cleaning
    newUrl.searchParams.set('id', result.shortId);
    window.history.pushState({}, '', newUrl.toString());

    alert(t('msg_saved_id').replace('{id}', result.shortId));
    await navigator.clipboard.writeText(newUrl.toString());

    return result;
}

export async function loadFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        try {
            const response = await fetch(`${API_BASE}/load?id=${id}`);
            if (!response.ok) {
                if (response.status === 404) alert(t('msg_not_found').replace('{id}', id));
                else throw new Error('Load failed: ' + response.status);
                return;
            }

            const result = await response.json();

            // Set Onwer
            appState.loadedBuildOwner = result.ownerId || null;

            // result.data is stringified JSON
            const state = JSON.parse(result.data);
            if (state) {
                appState.hydrate(state);
            }
        } catch (e) {
            console.error('Load Error:', e);
            alert(t('msg_load_error') + e.message);
        }
    }
}

export function getSaveButtonState() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        const token = getEditToken(id);
        const isOwner = appState.userProfile && appState.loadedBuildOwner === appState.userProfile.id;

        if (token || isOwner) return { textKey: 'update', style: 'update' };
        return { textKey: 'copy', style: 'copy' };
    }
    return { textKey: 'create_link', style: 'new' };
}
