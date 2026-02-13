/**
 * CUSTOM SELECT MODULE
 * Handles custom dropdown select logic
 */

import { closeCustomPicker } from './color-picker.js';

// Helper to set custom select value
export function setCustomSelectValue(row, index, value) {
    const selects = row.querySelectorAll('.custom-res-select');
    if (selects[index]) {
        const input = selects[index].querySelector('.res-slot-select');
        const trigger = selects[index].querySelector('.res-select-trigger');
        input.value = value;

        // Find text for this value
        const options = selects[index].querySelectorAll('.res-select-option');
        let text = '—';
        options.forEach(opt => {
            if (opt.dataset.value === value) {
                text = opt.textContent;
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
        trigger.textContent = text;
    }
}

export function initCustomSelectListeners() {
    // Global Click Listener for Menus
    document.addEventListener('mousedown', (e) => {
        // Toolbar Dropdowns
        if (!e.target.closest('.rte-dropdown') && !e.target.closest('#custom-color-picker')) {
            document.querySelectorAll('.rte-dropdown').forEach(d => d.classList.remove('active'));
            const cp = document.getElementById('custom-color-picker');
            if (cp && cp.style.display !== 'none') {
                closeCustomPicker();
            }
        }

        // Custom Dropdown Logic
        // Toggle Trigger
        if (e.target.closest('.res-select-trigger')) {
            const trigger = e.target.closest('.res-select-trigger');
            const container = trigger.closest('.custom-res-select');
            const options = container.querySelector('.res-select-options') ||
                document.querySelector('.res-select-options[data-owner="' + container.dataset.dropdownId + '"]');

            // Close others and return their dropdowns
            document.querySelectorAll('.custom-res-select.open').forEach(el => {
                if (el !== container) {
                    el.classList.remove('open');
                    const id = el.dataset.dropdownId;
                    if (id) {
                        const opts = document.querySelector('.res-select-options[data-owner="' + id + '"]');
                        if (opts && opts.parentElement === document.body) {
                            el.appendChild(opts);
                            opts.removeAttribute('data-owner');
                            opts.style.cssText = '';
                        }
                    }
                }
            });

            // Toggle current
            const isOpen = container.classList.toggle('open');

            if (isOpen && options) {
                // Generate unique ID if needed
                if (!container.dataset.dropdownId) {
                    container.dataset.dropdownId = 'dd-' + Date.now();
                }
                options.dataset.owner = container.dataset.dropdownId;

                // Get position before moving
                const rect = trigger.getBoundingClientRect();

                // Move to body
                document.body.appendChild(options);

                // Apply fixed positioning
                options.style.position = 'fixed';
                options.style.top = rect.bottom + 'px';
                options.style.left = rect.left + 'px';
                options.style.display = 'flex';
                options.style.flexDirection = 'column';
                options.style.zIndex = '999999';
                options.style.background = '#000';
                options.style.border = '1px solid #333';
                options.style.boxShadow = '0 4px 12px rgba(0,0,0,0.8)';
            } else if (options) {
                // Move back to container
                container.appendChild(options);
                options.removeAttribute('data-owner');
                options.style.cssText = '';
            }

            e.stopPropagation();
            return;
        }

        // Select Option (may be in body now)
        if (e.target.closest('.res-select-option')) {
            const opt = e.target.closest('.res-select-option');
            const options = opt.closest('.res-select-options');

            // Find container - might be parent or might need to use data-owner
            let container = opt.closest('.custom-res-select');
            if (!container && options && options.dataset.owner) {
                container = document.querySelector('.custom-res-select[data-dropdown-id="' + options.dataset.owner + '"]');
            }

            if (!container) return;

            const trigger = container.querySelector('.res-select-trigger');
            const hiddenInput = container.querySelector('.res-slot-select');

            // Update UI
            trigger.textContent = opt.textContent;
            options.querySelectorAll('.res-select-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');

            // Update Value
            hiddenInput.value = opt.dataset.value;

            // Close and move back
            container.classList.remove('open');
            if (options.parentElement === document.body) {
                container.appendChild(options);
                options.removeAttribute('data-owner');
                options.style.cssText = '';
            }

            e.stopPropagation();
            return;
        }

        // Close Dropdown Outside
        if (!e.target.closest('.custom-res-select') && !e.target.closest('.res-select-options')) {
            document.querySelectorAll('.custom-res-select.open').forEach(el => {
                el.classList.remove('open');
                const id = el.dataset.dropdownId;
                if (id) {
                    const opts = document.querySelector('.res-select-options[data-owner="' + id + '"]');
                    if (opts && opts.parentElement === document.body) {
                        el.appendChild(opts);
                        opts.removeAttribute('data-owner');
                        opts.style.cssText = '';
                    }
                }
            });
        }
    });
}
