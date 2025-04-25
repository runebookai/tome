import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter(),
        alias: {
            '$components': './src/components',
            '$routes': './src/routes',
        },
        prerender: {
            'entries': [
                "/",
                "/chat/[session_id]",
                "/mcp-servers",
                "/models",
                "/settings",
            ],
            'handleHttpError': "warn"
        }
    }
};

export default config;
