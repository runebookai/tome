import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { McpServer } from '$lib/models';

export const load: PageLoad = async (): Promise<void> => {
    const server = McpServer.last();

    if (server) {
        await goto(`/mcp-servers/${server.id}`);
    } else {
        await goto('/mcp-servers/smithery');
    }
};

export const prerender = true;
export const ssr = false;
