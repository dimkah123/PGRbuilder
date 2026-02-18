import {
    CHARACTER_IMAGES,
    ELEMENT_IMAGES,
    CLASS_IMAGES,
    WEAPON_IMAGES,
    CUB_IMAGES,
    MEMORY_IMAGES
} from '$lib/data.js';

/**
 * Collects all unique image URLs from the data constants.
 * @returns {Set<string>} A set of unique image URLs.
 */
function getAllImageUrls() {
    const urls = new Set();

    // 1. Character Images (Array of objects with 'file' property)
    CHARACTER_IMAGES.forEach(char => {
        if (char.file) urls.add(char.file);
    });

    // 2. Element Images (Object values)
    Object.values(ELEMENT_IMAGES).forEach(url => {
        if (url) urls.add(url);
    });

    // 3. Class Images (Object values)
    Object.values(CLASS_IMAGES).forEach(url => {
        if (url) urls.add(url);
    });

    // 4. Weapon Images (Object values)
    Object.values(WEAPON_IMAGES).forEach(url => {
        if (url) urls.add(url);
    });

    // 5. CUB Images (Object values)
    Object.values(CUB_IMAGES).forEach(url => {
        if (url) urls.add(url);
    });

    // 6. Memory Images (Object values)
    Object.values(MEMORY_IMAGES).forEach(url => {
        if (url) {
            if (url.includes('-Icon-1.webp')) {
                urls.add(url);
                urls.add(url.replace('-Icon-1.webp', '-Icon-2.webp'));
                urls.add(url.replace('-Icon-1.webp', '-Icon-3.webp'));
            } else {
                urls.add(url);
            }
        }
    });

    return urls;
}

/**
 * Preloads images in the background using requestIdleCallback.
 * This ensures the main thread remains responsive for user interactions.
 */
export function preloadImages() {
    if (typeof window === 'undefined') return;

    // Prevent GC by storing references globally
    if (!window.pgr_preloaded_images) {
        window.pgr_preloaded_images = [];
    }

    const urls = Array.from(getAllImageUrls());
    const totalImages = urls.length;
    let loadedCount = 0;
    const batchSize = 10; // Process 10 images per idle callback

    console.log(`[ImagePreloader] Starting background preload for ${totalImages} images...`);

    function processBatch(deadline) {
        while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && urls.length > 0) {
            const batch = urls.splice(0, batchSize);

            batch.forEach(url => {
                // Check if already preloaded
                if (window.pgr_preloaded_images.some(img => img.src === url || img.src.endsWith(url))) {
                    return;
                }

                const img = new Image();
                img.crossOrigin = "anonymous"; // Try to prevent CORS issues affecting cache
                img.src = url;
                window.pgr_preloaded_images.push(img); // Store reference to prevent GC
            });

            loadedCount += batch.length;
        }

        if (urls.length > 0) {
            // Schedule next batch
            requestIdleCallback(processBatch, { timeout: 1000 });
        } else {
            console.log(`[ImagePreloader] Finished preloading ${loadedCount} images.`);
        }
    }

    // Fallback for browsers without requestIdleCallback (e.g., Safari < 2023)
    if ('requestIdleCallback' in window) {
        requestIdleCallback(processBatch, { timeout: 1000 });
    } else {
        // Simple timeout fallback
        setTimeout(() => {
            const processChunk = () => {
                const batch = urls.splice(0, batchSize);
                batch.forEach(url => {
                    // Check if already preloaded
                    if (window.pgr_preloaded_images.some(img => img.src === url || img.src.endsWith(url))) {
                        return;
                    }

                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.src = url;
                    window.pgr_preloaded_images.push(img);
                });
                loadedCount += batch.length;

                if (urls.length > 0) {
                    setTimeout(processChunk, 50);
                } else {
                    console.log(`[ImagePreloader] Finished preloading ${loadedCount} images (fallback).`);
                }
            };
            processChunk();
        }, 1000);
    }
}

/**
 * Preloads a specific set of images.
 * @param {string[]} imageUrls - Array of image URLs to preload.
 * @param {string} label - Label for console logging.
 */
function preloadSpecificImages(imageUrls, label) {
    if (typeof window === 'undefined') return;
    if (!window.pgr_preloaded_images) window.pgr_preloaded_images = [];

    const uniqueUrls = new Set(imageUrls.filter(url => url));
    let startCount = window.pgr_preloaded_images.length;

    uniqueUrls.forEach(url => {
        // Check if already preloaded (optimization)
        if (window.pgr_preloaded_images.some(img => img.src === url || img.src.endsWith(url))) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        window.pgr_preloaded_images.push(img);
    });

    let endCount = window.pgr_preloaded_images.length;
    let added = endCount - startCount;

    if (added > 0) {
        console.log(`[ImagePreloader] Preloaded ${added} ${label} images on hover.`);
    }
}

export function preloadCharacterImages() {
    const urls = [];
    CHARACTER_IMAGES.forEach(char => {
        if (char.file) urls.push(char.file);
    });
    preloadSpecificImages(urls, "Character");
}

export function preloadMemoryImages() {
    // MEMORY_IMAGES is an object of values (Icon-1 by default)
    // We need to preload Icon-1, Icon-2, and Icon-3 for each memory to prevent re-loading on slot switch
    const defaultUrls = Object.values(MEMORY_IMAGES);
    const allUrls = [];

    defaultUrls.forEach(url => {
        if (url && url.includes('-Icon-1.webp')) {
            allUrls.push(url); // Icon-1
            allUrls.push(url.replace('-Icon-1.webp', '-Icon-2.webp')); // Icon-2
            allUrls.push(url.replace('-Icon-1.webp', '-Icon-3.webp')); // Icon-3
        } else {
            allUrls.push(url);
        }
    });

    preloadSpecificImages(allUrls, "Memory");
}

export function preloadWeaponImages() {
    const urls = Object.values(WEAPON_IMAGES);
    preloadSpecificImages(urls, "Weapon");
}

/**
 * Preloads a list of images and returns a Promise that resolves when they are loaded.
 * Used for blocking the loading screen until critical assets are ready.
 * @param {string[]} imageUrls
 * @returns {Promise<void>}
 */
export function preloadCriticalImages(imageUrls) {
    if (typeof window === 'undefined') return Promise.resolve();
    if (!window.pgr_preloaded_images) window.pgr_preloaded_images = [];

    const uniqueUrls = new Set(imageUrls.filter(url => url));
    const promises = [];

    uniqueUrls.forEach(url => {
        // Check if already preloaded
        if (window.pgr_preloaded_images.some(img => img.src === url || img.src.endsWith(url))) {
            return;
        }

        const p = new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Don't block on error
            img.src = url;
            window.pgr_preloaded_images.push(img);
        });
        promises.push(p);
    });

    if (promises.length > 0) {
        console.log(`[ImagePreloader] Blocking for ${promises.length} critical images...`);
    }

    // Timeout after 2 seconds to avoid hanging forever if network is slow/broken
    const timeout = new Promise(resolve => setTimeout(resolve, 2000));

    return Promise.race([Promise.all(promises), timeout]);
}
