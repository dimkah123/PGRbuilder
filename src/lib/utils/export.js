import html2canvas from 'html2canvas';

export async function handleExport(charName = 'UNIT') {
    const element = document.querySelector('.app-container');
    if (!element) return;

    // 1. Create an Iframe to simulate Desktop Viewport
    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, {
        position: 'fixed',
        top: '-10000px',
        left: '-10000px',
        width: '1920px',
        height: '1080px',
        border: 'none',
        visibility: 'hidden' // Hide from user, but needs to be rendered
    });

    document.body.appendChild(iframe);

    // 2. Setup Iframe Content
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write('<!DOCTYPE html><html><head></head><body></body></html>');
    doc.close();

    // 3. Copy Styles (Link tags and Style tags) from main document
    // We need to wait for them to load in the iframe, but usually cloning them is enough
    const styles = document.querySelectorAll('link[rel="stylesheet"], style');
    styles.forEach(style => {
        doc.head.appendChild(style.cloneNode(true));
    });

    // 3.1 Inject Global Deskop Overrides
    const globalStyle = doc.createElement('style');
    // Allow height to grow beyond 1080px if content requires it
    globalStyle.textContent = `
        body { 
            background-color: #000 !important; 
            margin: 0; 
            padding: 0;
            width: 1920px;
            min-height: 1080px;
            height: auto !important;
            overflow: hidden;
        }
        .app-container {
            transform: none !important;
            margin: 0 !important;
            width: 1920px !important;
            min-height: 1080px !important;
            height: auto !important;
            zoom: 1 !important;
        }
    `;
    doc.head.appendChild(globalStyle);

    // 4. Clone and Prepare Element
    const clone = element.cloneNode(true);

    // Modify Clone for Export (Hide controls, fix inputs)
    const ctls = clone.querySelectorAll('.img-controls, .char-change-btn, .add-build-wide-btn, .mem-remove-btn');
    ctls.forEach(el => el.style.display = 'none');

    // Fix Portrait Image Transform & Fit
    const originalImg = element.querySelector('.portrait-img');
    const cloneImg = clone.querySelector('.portrait-img');
    if (originalImg && cloneImg) {
        cloneImg.style.objectFit = 'cover';
        cloneImg.style.transform = originalImg.style.transform;
    }

    // Fix Portrait Area Height
    const originalPortrait = element.querySelector('.portrait-area');
    const clonePortrait = clone.querySelector('.portrait-area');
    if (originalPortrait && clonePortrait) {
        // We want the height to be what it WOULD be on desktop. 
        // If we copy bounding client height from mobile, we get mobile height (400px).
        // Desktop height is auto/flex. Let's unset height and let CSS handle it?
        // Or hardcode if we know it.
        // Actually, forcing 1920px width should make it render correctly.
        clonePortrait.style.height = '';
        clonePortrait.style.minHeight = '';
    }

    // Fix Inputs -> Divs
    // Unlike previous "live" clone, we can do this cleanly in the iframe context
    // But we need to grab values from the ORIGINAL element because cloneNode doesn't copy current value of inputs
    const originalInputs = element.querySelectorAll('input, textarea, .rich-textarea');
    const cloneInputs = clone.querySelectorAll('input, textarea, .rich-textarea');

    if (originalInputs.length === cloneInputs.length) {
        originalInputs.forEach((orig, i) => {
            const cl = cloneInputs[i];

            let value = orig.value;
            if (orig.tagName === 'DIV') value = orig.innerText; // RichText

            const div = doc.createElement('div');
            div.className = orig.className; // Keep classes for styling

            if (orig.tagName === 'DIV' && orig.classList.contains('rich-textarea')) {
                div.innerHTML = orig.innerHTML;
                div.style.whiteSpace = 'pre-wrap';
            } else {
                div.textContent = value || orig.getAttribute('placeholder') || '';
            }

            // Reset basic input styles for the div
            div.style.background = 'transparent';
            div.style.border = 'none';

            const computed = window.getComputedStyle(orig);
            div.style.textAlign = computed.textAlign;
            div.style.color = computed.color;
            // div.style.fontSize = computed.fontSize; // DO NOT COPY FONT SIZE

            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = div.style.textAlign === 'center' ? 'center' : 'flex-start';

            cl.style.display = 'none';
            cl.parentNode.insertBefore(div, cl);
        });
    }

    doc.body.appendChild(clone);

    // 5. Wait a bit for fonts/styles to apply
    // Important! Fonts might take a moment if not cached or if iframe re-requests.
    await new Promise(resolve => setTimeout(resolve, 500));

    // Calculate actual height
    // Clone is in the body, which is 1920px wide. Body height is auto.
    const bodyHeight = doc.body.scrollHeight;
    const captureHeight = Math.max(1080, bodyHeight);

    // Resize iframe to match content (so html2canvas can capture it all)
    iframe.style.height = `${captureHeight}px`;

    // 6. Capture
    html2canvas(doc.body, {
        backgroundColor: '#000000',
        scale: 1, // 1:1 since we are at 1920px already
        width: 1920,
        height: captureHeight,
        windowWidth: 1920,
        windowHeight: captureHeight,
        logging: false,
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `GR_DB_${charName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(iframe);
    }).catch(err => {
        console.error("Export Error:", err);
        alert("Export Error (Mobile): " + err.message);
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
    });
}
