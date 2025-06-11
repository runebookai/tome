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
                "/error",
                "/chat/[session_id]",
                "/mcp-servers",
                "/mcp-servers/new",
                "/mcp-servers/install",
                "/mcp-servers/[name]",
                "/mcp-servers/smithery",
                "/models",
                "/settings",
                "/tasks"
            ],
            'handleHttpError': "warn"
        }
    }
};

export default config;
