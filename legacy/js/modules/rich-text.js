/**
 * RICH TEXT EDITOR MODULE
 * Handles RTE functionality with toolbar and formatting
 */

let activeEditor = null;

export function formatDoc(btn, cmd, value) {
    document.execCommand('styleWithCSS', false, true);
    document.execCommand(cmd, false, value);
    updateToolbarState();
    if (activeEditor) activeEditor.focus();
    if (btn && btn.closest('.rte-dropdown-menu')) {
        btn.closest('.rte-dropdown').classList.remove('active');
    }
}

export function insertSeparator(btn) {
    const editor = window.getSelection().focusNode.parentElement.closest('.rich-textarea');
    if (!editor) return;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const hr = document.createElement('div');
        hr.className = 'separator-line';
        hr.contentEditable = "false";

        const pAfter = document.createElement('div');
        pAfter.innerHTML = '<br>';

        range.deleteContents();
        range.insertNode(pAfter);
        range.insertNode(hr);

        if (editor.firstChild === hr) {
            const pBefore = document.createElement('div');
            pBefore.innerHTML = '<br>';
            editor.insertBefore(pBefore, hr);
        }

        range.setStart(pAfter, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    const toolbar = document.querySelector('.rte-toolbar');
    if (toolbar) {
        toolbar.classList.remove('visible');
        toolbar.style.display = 'none';
    }
}

export function showToolbar(range) {
    const toolbar = document.querySelector('.rte-toolbar');
    if (!toolbar) return;

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    toolbar.style.display = 'flex';
    toolbar.classList.add('visible');

    const toolbarHeight = toolbar.offsetHeight;
    const top = rect.top - toolbarHeight - 12;
    const left = rect.left + (rect.width / 2) - (toolbar.offsetWidth / 2);

    toolbar.style.top = `${top + window.scrollY}px`;
    toolbar.style.left = `${left + window.scrollX}px`;
}

export function hideToolbar() {
    const toolbar = document.querySelector('.rte-toolbar');
    if (toolbar) {
        toolbar.classList.remove('visible');
        toolbar.style.display = 'none';
    }
}

export function updateToolbarState() {
    const toolbar = document.querySelector('.rte-toolbar');
    if (!toolbar) return;

    const boldBtn = toolbar.querySelector('[data-cmd="bold"]');
    const italicBtn = toolbar.querySelector('[data-cmd="italic"]');

    if (boldBtn) {
        if (document.queryCommandState('bold')) boldBtn.classList.add('active'); else boldBtn.classList.remove('active');
    }
    if (italicBtn) {
        if (document.queryCommandState('italic')) italicBtn.classList.add('active'); else italicBtn.classList.remove('active');
    }
}

// Timeout Debounce for processing text
const editorTimeouts = new WeakMap();

export function handleRichInput(editor) {
    const existingTimeout = editorTimeouts.get(editor);
    if (existingTimeout) clearTimeout(existingTimeout);

    const newTimeout = setTimeout(() => {
        // Here we could process text for terms if needed
        editorTimeouts.delete(editor);
    }, 1000);

    editorTimeouts.set(editor, newTimeout);
}

export function highlightTermsInEditor(editor) {
    if (typeof TERMINOLOGY_DB === 'undefined') return;

    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
        const text = node.nodeValue;
        if (!text.trim()) return;

        let newHtml = text;
        let nodeChanged = false;
        const terms = Object.keys(TERMINOLOGY_DB).sort((a, b) => b.length - a.length);

        for (const term of terms) {
            const regex = new RegExp(`(^|\\s|\\.|,|_|-)(${term})($|\\s|\\.|,|_|-)`, 'gi');
            if (regex.test(newHtml)) {
                newHtml = newHtml.replace(regex, (match, prefix, keyword, suffix) => {
                    if (node.parentNode.classList.contains('term-highlight')) return match;
                    return `${prefix}<span class="term-highlight" data-desc="${TERMINOLOGY_DB[term]}">${keyword}</span>${suffix}`;
                });
                nodeChanged = true;
            }
        }

        if (nodeChanged && newHtml !== text) {
            const wrapper = document.createElement('span');
            wrapper.innerHTML = newHtml;
            node.parentNode.replaceChild(wrapper, node);
            const children = Array.from(wrapper.childNodes);
            children.forEach(child => wrapper.parentNode.insertBefore(child, wrapper));
            wrapper.remove();
        }
    });
}

export function setActiveEditor(editor) {
    activeEditor = editor;
}

export function initRichTextListeners() {
    // Global Listener for RTE Toolbar
    document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        const toolbar = document.querySelector('.rte-toolbar');
        if (toolbar && toolbar.contains(document.activeElement)) return;

        if (!selection || selection.rangeCount === 0) {
            hideToolbar();
            return;
        }

        const range = selection.getRangeAt(0);
        let container = range.commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentElement;

        const editor = container ? container.closest('.rich-textarea') : null;
        const text = selection.toString();

        if (!editor || selection.isCollapsed || text.length === 0 || !editor.contains(container)) {
            hideToolbar();
            return;
        }

        showToolbar(range);
        activeEditor = editor;
        updateToolbarState();
    });

    // Editor Focus Out Listener
    document.addEventListener('focusout', (e) => {
        if (e.target.classList.contains('rich-textarea')) {
            setTimeout(() => {
                if (document.activeElement !== e.target) {
                    highlightTermsInEditor(e.target);
                }
            }, 100);
        }
    });
}
