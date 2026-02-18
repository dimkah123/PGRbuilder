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
        if (url) urls.add(url);
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
    // MEMORY_IMAGES is an object of values
    const urls = Object.values(MEMORY_IMAGES);
    preloadSpecificImages(urls, "Memory");
}

export function preloadWeaponImages() {
    // WEAPON_IMAGES is an object of values
    const urls = Object.values(WEAPON_IMAGES);
    preloadSpecificImages(urls, "Weapon");
}
