/**
 * CLOUD SAVE MODULE
 * Handles Vercel API cloud save/load/update operations
 */

import { getAllState, restoreState } from './state.js';

// Vercel API base URL
const API_BASE = 'https://pg-rbuilder.vercel.app/api';

// Helpers for edit tokens
function getEditToken(id) {
    return localStorage.getItem('edit_' + id);
}

function setEditToken(id, token) {
    localStorage.setItem('edit_' + id, token);
}

export async function saveToCloud() {
    const btn = document.getElementById('save-cloud-btn');
    if (btn) {
        btn.textContent = '...';
        btn.disabled = true;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const existingId = urlParams.get('id');
    const existingToken = existingId ? getEditToken(existingId) : null;

    try {
        // Если есть существующий ID и токен - пробуем обновить
        if (existingId && existingToken) {
            const updated = await updateBuild(existingId, existingToken);
            if (updated) {
                alert('Сборка обновлена! Ссылка осталась прежней.');
                return;
            } else {
                // Токен невалидный - предложим создать копию
                if (!confirm('Нет прав на редактирование. Создать новую копию?')) {
                    return;
                }
            }
        }

        // Создаём новую сборку
        await createNewBuild();

    } catch (e) {
        console.error('Save Error:', e);
        alert('Ошибка сохранения: ' + e.message);
    } finally {
        if (btn) {
            updateSaveButtonState();
            btn.disabled = false;
        }
    }
}

async function updateBuild(shortId, editToken) {
    const state = getAllState();
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

    if (response.ok) {
        return true;
    } else if (response.status === 403) {
        return false; // Нет прав
    } else {
        throw new Error('Update failed: ' + response.status);
    }
}

async function createNewBuild() {
    const state = getAllState();
    const stateString = JSON.stringify(state);

    const response = await fetch(`${API_BASE}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: stateString })
    });

    if (!response.ok) {
        throw new Error('Save failed: ' + response.status);
    }

    const result = await response.json();

    // Store edit token
    setEditToken(result.shortId, result.editToken);

    // Update URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('d');
    newUrl.searchParams.delete('data');
    newUrl.searchParams.set('id', result.shortId);
    window.history.pushState({ path: newUrl.toString() }, '', newUrl.toString());

    alert(`Сборка сохранена! ID: ${result.shortId}\nСсылка автоматически скопирована.`);
    navigator.clipboard.writeText(newUrl.toString());

    updateSaveButtonState();
}

export async function loadFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        document.body.style.cursor = 'wait';
        try {
            const response = await fetch(`${API_BASE}/load?id=${id}`);

            if (!response.ok) {
                if (response.status === 404) {
                    alert('Сборка не найдена (ID: ' + id + ')');
                } else {
                    throw new Error('Load failed: ' + response.status);
                }
                return;
            }

            const result = await response.json();
            const state = JSON.parse(result.data);

            if (state) {
                restoreState(state);
                setTimeout(updateSaveButtonState, 100);
            }
        } catch (e) {
            console.error('Load Error:', e);
            alert('Ошибка загрузки: ' + e.message);
        } finally {
            document.body.style.cursor = 'default';
        }
    } else {
        // Fallback for old URL format
        if (typeof UrlOptimizer !== 'undefined') {
            const state = UrlOptimizer.parseLink();
            if (state) {
                restoreState(state);
            }
        }
    }
}

export function updateSaveButtonState() {
    const btn = document.getElementById('save-cloud-btn');
    if (!btn) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        const token = getEditToken(id);
        if (token) {
            btn.textContent = 'ОБНОВИТЬ';
            btn.classList.add('btn-update');
            btn.style.border = '1px solid #4caf50';
            btn.style.color = '#4caf50';
        } else {
            btn.textContent = 'СОЗДАТЬ КОПИЮ';
            btn.classList.remove('btn-update');
            btn.style.border = '1px solid #444';
            btn.style.color = '#ccc';
        }
    } else {
        btn.textContent = 'СОЗДАТЬ ССЫЛКУ';
        btn.classList.remove('btn-update');
        btn.style.border = '1px solid #444';
        btn.style.color = '#ccc';
    }
}
