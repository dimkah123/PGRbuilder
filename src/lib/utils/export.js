import html2canvas from 'html2canvas';

export function handleExport(charName = 'UNIT') {
    const element = document.querySelector('.app-container');
    if (!element) return;

    // Use a clone to modify for capture
    const clone = element.cloneNode(true);

    // Setup wrapper for clone (off-screen)
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.top = '-9999px';
    wrapper.style.left = '0';
    wrapper.style.width = '1920px'; // Forced width
    wrapper.style.zIndex = '-1';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Apply Styles to Clone for Capture
    clone.style.backgroundColor = '#000000';
    clone.style.padding = '20px';
    clone.style.width = '1920px';
    clone.style.height = 'auto'; // Auto height
    clone.style.transform = 'none';
    clone.style.boxSizing = 'content-box';

    // Hide controls
    const ctls = clone.querySelectorAll('.img-controls, .char-change-btn, .add-build-wide-btn, .mem-remove-btn');
    ctls.forEach(el => el.style.display = 'none');

    // Fix Portrait Image Transform & Fit
    // Original elements
    const originalImg = element.querySelector('.portrait-img');
    const cloneImg = clone.querySelector('.portrait-img');
    if (originalImg && cloneImg) {
        // Copy transform manually because cloneNode might not get computed styles
        // But inline styles are copied.
        // We ensure objectFit
        cloneImg.style.objectFit = 'cover';
        cloneImg.style.transform = originalImg.style.transform;
    }

    // Fix Portrait Area Height
    const originalPortrait = element.querySelector('.portrait-area');
    const clonePortrait = clone.querySelector('.portrait-area');
    if (originalPortrait && clonePortrait) {
        const rect = originalPortrait.getBoundingClientRect();
        clonePortrait.style.height = rect.height + 'px';
        clonePortrait.style.minHeight = rect.height + 'px';
        clonePortrait.style.flexGrow = '0';
    }

    // Replace Inputs/Textareas with Divs
    const originalInputs = element.querySelectorAll('input, textarea, [contenteditable]');
    const cloneInputs = clone.querySelectorAll('input, textarea, [contenteditable]'); // Note: RichTextEditor uses contenteditable div

    // We need to map by index, hope they match tree structure (should)
    // Actually [contenteditable] might need special handling if it's nested differently
    // Let's do inputs/textareas first

    const originals = [];
    const clones = [];

    // Gather all relevant inputs
    element.querySelectorAll('input, textarea').forEach(el => originals.push(el));
    clone.querySelectorAll('input, textarea').forEach(el => clones.push(el));

    // Gather contenteditables (RichTextEditor)
    element.querySelectorAll('.rich-textarea').forEach(el => originals.push(el));
    clone.querySelectorAll('.rich-textarea').forEach(el => clones.push(el));

    originals.forEach((orig, i) => {
        const cl = clones[i];
        if (!cl) return;

        // If it's file input or hidden, ignore
        if (orig.type === 'file' || orig.style.display === 'none') return;

        let value = orig.value;
        if (orig.tagName === 'DIV' && orig.isContentEditable) {
            value = orig.innerText; // or innerHTML? innerText strips formatting? 
            // For rich text, we want to KEEP the HTML but remove contenteditable
            // If it's RichText, logic below for replacement might be too aggressive.
            // Let's handle RichText separately if possible.
        }

        const style = window.getComputedStyle(orig);
        const div = document.createElement('div');

        if (orig.tagName === 'DIV' && orig.classList.contains('rich-textarea')) {
            div.innerHTML = orig.innerHTML; // Keep formatting
            div.style.whiteSpace = 'pre-wrap';
            div.style.alignItems = 'flex-start';
            div.style.height = '100%';
            div.className = orig.className; // Keep classes
        } else {
            div.textContent = value || orig.getAttribute('placeholder') || '';
            // Flex center for centered inputs
            if (style.textAlign === 'center') {
                div.style.display = 'flex';
                div.style.justifyContent = 'center';
                div.style.alignItems = 'center';
            } else {
                div.style.display = 'block';
            }
        }

        // Copy ONLY essential text styles that might be strictly set, but preferably trust CSS.
        // If we copy fontSize/width from mobile, we break the desktop render.
        // We will only copy text-align and color which are usually consistent or inline.
        // Actually, let's copy nothing if possible and rely on classes? 
        // But some inputs might have specific alignments.

        div.style.textAlign = style.textAlign;
        div.style.color = style.color;
        div.style.fontWeight = style.fontWeight;
        div.style.fontFamily = style.fontFamily;
        div.style.textTransform = style.textTransform;
        div.style.letterSpacing = style.letterSpacing;
        // Do NOT copy fontSize, width, height, styling (border, padding) as these change with resolution.

        div.style.background = 'transparent';
        div.style.border = 'none';

        // For underline inputs (top section), we might need the border-bottom.
        // But in CSS .char-name-input has border-bottom.
        // If we strip it, we lose it? The original input has it. 
        // The div replacing it essentially mimics the input's box.
        // Let's rely on the classNames being present on the div implies we might need to verify if the div inherits the border.
        // The original logic replaced the input with a div but KEPT the classes on the input? 
        // No, it inserted the div. The div doesn't have the input's classes! 

        // CRITICAL FIX: Transfer classes from input to div!
        div.className = orig.className;

        // Remove 'mem-input' etc if they cause issues on a div? 
        // Usually input classes work on divs if they just set typography/border.

        cl.style.display = 'none';
        cl.parentNode.insertBefore(div, cl);
    });

    html2canvas(clone, {
        backgroundColor: '#000000',
        scale: 1,
        useCORS: true,
        logging: false,
        width: 1920,
        height: 1080, // Force height too?
        windowWidth: 1920,
        windowHeight: 1080,
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `GR_DB_${charName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(wrapper);
    }).catch(err => {
        console.error("Export Error:", err);
        alert("Export Error. See console for details.");
        if (document.body.contains(wrapper)) document.body.removeChild(wrapper);
    });
}
