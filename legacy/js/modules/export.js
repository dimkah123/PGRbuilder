/**
 * EXPORT MODULE
 * Handles PNG export using html2canvas
 */

export function handleExport() {
    if (typeof html2canvas === 'undefined') {
        const btn = document.getElementById('export-btn');
        const origText = btn.textContent;
        btn.textContent = 'LOADING LIB...';
        btn.disabled = true;

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => {
            btn.textContent = origText;
            btn.disabled = false;
            doExport();
        };
        script.onerror = () => {
            alert('Failed to load html2canvas library');
            btn.textContent = origText;
            btn.disabled = false;
        };
        document.head.appendChild(script);
    } else {
        doExport();
    }
}

function doExport() {
    const element = document.getElementById('capture-area');
    const clone = element.cloneNode(true);

    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.top = '-9999px';
    wrapper.style.left = '0';
    wrapper.style.width = '1920px';
    wrapper.style.zIndex = '-1';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    clone.style.backgroundColor = '#000000';
    clone.style.padding = '20px';
    clone.style.width = '1920px';
    clone.style.height = 'auto';
    clone.style.transform = 'none';
    clone.style.boxSizing = 'content-box';

    const ctls = clone.querySelector('.img-controls');
    if (ctls) ctls.style.display = 'none';

    // Hide "Add Set" button
    const addBuildBtn = clone.querySelector('#add-build-btn-wide');
    if (addBuildBtn) addBuildBtn.style.display = 'none';

    // Sync Character Image Transform
    const originalImg = element.querySelector('.portrait-img');
    const cloneImg = clone.querySelector('.portrait-img');
    if (originalImg && cloneImg) {
        // Copy the transform style (zoom/pan)
        cloneImg.style.transform = originalImg.style.transform || 'none';
        cloneImg.style.objectFit = 'cover';
        cloneImg.style.objectPosition = originalImg.style.objectPosition || 'top center';
    }

    // Fix portrait-area height for export
    const originalPortrait = element.querySelector('.portrait-area');
    const clonePortrait = clone.querySelector('.portrait-area');
    if (originalPortrait && clonePortrait) {
        const portraitRect = originalPortrait.getBoundingClientRect();
        clonePortrait.style.height = portraitRect.height + 'px';
        clonePortrait.style.minHeight = portraitRect.height + 'px';
        clonePortrait.style.flexGrow = '0';
    }

    // Sync Inputs
    const originalInputs = element.querySelectorAll('input, textarea');
    const cloneInputs = clone.querySelectorAll('input, textarea');
    originalInputs.forEach((orig, i) => {
        if (cloneInputs[i]) cloneInputs[i].value = orig.value;
    });

    // Swap to Divs
    cloneInputs.forEach(input => {
        if (input.type === 'file') return;
        if (input.style.display === 'none') return;

        const style = window.getComputedStyle(input);
        const div = document.createElement('div');
        div.textContent = input.value || input.getAttribute('placeholder') || '';

        // Copy styles
        Array.from(style).forEach(key => {
            div.style[key] = style[key];
        });

        // Manual override for critical styles if compute fails or iteration is too heavy
        div.style.fontFamily = style.fontFamily;
        div.style.fontSize = style.fontSize;
        div.style.fontWeight = style.fontWeight;
        div.style.color = style.color;
        div.style.textAlign = style.textAlign;
        div.style.display = (style.textAlign === 'center') ? 'flex' : 'block';
        if (style.textAlign === 'center') {
            div.style.justifyContent = 'center';
            div.style.alignItems = 'center';
        }

        if (input.classList.contains('tac-text')) {
            div.style.whiteSpace = 'pre-wrap';
            div.style.alignItems = 'flex-start';
            div.style.height = '100%';
        }

        // Reset some styles
        div.style.border = 'none';
        div.style.background = 'transparent';
        div.style.borderBottom = style.borderBottom;

        input.style.display = 'none';
        input.parentNode.insertBefore(div, input);
    });

    clone.querySelectorAll('[contenteditable]').forEach(ce => {
        ce.removeAttribute('contenteditable');
        ce.style.border = 'none';
        ce.style.outline = 'none';
    });

    html2canvas(clone, {
        backgroundColor: '#000000',
        scale: 1,
        useCORS: true,
        letterRendering: true,
        windowWidth: 1920,
        scrollY: 0
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `GR_DB_${document.getElementById('char-name-display').value || 'UNIT'}.png`;
        link.href = canvas.toDataURL();
        link.click();
        document.body.removeChild(wrapper);
    }).catch(err => {
        console.error("Export Error:", err);
        alert("Export Error. See console for details.");
        if (document.body.contains(wrapper)) document.body.removeChild(wrapper);
    });
}
