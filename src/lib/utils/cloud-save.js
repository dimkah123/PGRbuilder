import { appState } from '$lib/state.svelte.js';

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

    try {
        if (existingId && existingToken) {
            const updated = await updateBuild(existingId, existingToken);
            if (updated) {
                alert('Сборка обновлена! Ссылка осталась прежней.');
                return { success: true, updated: true };
            } else {
                if (!confirm('Нет прав на редактирование. Создать новую копию?')) {
                    return { success: false, reason: 'cancelled' };
                }
            }
        }

        const result = await createNewBuild();
        return { success: true, new: true, id: result.shortId };

    } catch (e) {
        console.error('Save Error:', e);
        alert('Ошибка сохранения: ' + e.message);
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
            editToken: editToken,
            data: stateString
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
        body: JSON.stringify({ data: stateString })
    });

    if (!response.ok) throw new Error('Save failed: ' + response.status);

    const result = await response.json();
    setEditToken(result.shortId, result.editToken);

    // Update URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('d');
    newUrl.searchParams.delete('data'); // Legacy cleaning
    newUrl.searchParams.set('id', result.shortId);
    window.history.pushState({}, '', newUrl.toString());

    alert(`Сборка сохранена! ID: ${result.shortId}\nСсылка автоматически скопирована.`);
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
                if (response.status === 404) alert('Сборка не найдена (ID: ' + id + ')');
                else throw new Error('Load failed: ' + response.status);
                return;
            }

            const result = await response.json();
            // result.data is stringified JSON
            const state = JSON.parse(result.data);
            if (state) {
                appState.hydrate(state);
            }
        } catch (e) {
            console.error('Load Error:', e);
            alert('Ошибка загрузки: ' + e.message);
        }
    }
}

export function getSaveButtonState() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        const token = getEditToken(id);
        if (token) return { text: 'ОБНОВИТЬ', style: 'update' };
        return { text: 'СОЗДАТЬ КОПИЮ', style: 'copy' };
    }
    return { text: 'СОЗДАТЬ ССЫЛКУ', style: 'new' };
}
