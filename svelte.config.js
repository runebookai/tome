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
            '$events': './src/events',
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
                "/apps",
                "/apps/import",
                "/apps/new",
                "/apps/[app_id]",
                "/apps/[app_id]/edit",
                "/apps/[app_id]/export",
                "/apps/[app_id]/runs/[run_id]",
                "/relays",
                "/relays/new",
                "/relays/[relay_id]",
                "/relays/[relay_id]/edit",
            ],
            'handleHttpError': "warn"
        }
    }
};

export default config;
