import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter({
            fallback: '404.html'
        }),
        inlineStyleThreshold: 51200,
        prerender: {
            handleHttpError: ({ path, message }) => {
                // Ignore missing assets/links during build
                if (path.startsWith('/Image/')) {
                    return;
                }
                // Log and continue for others
                console.warn(`Prerender error for ${path}: ${message}`);
            }
        }
    }
};

export default config;
