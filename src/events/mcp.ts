import { type Event } from '@tauri-apps/api/event';
import { goto } from '$app/navigation';

import { listen } from '$events/registry';
import type { MCPInstallEvent } from '$events/types';
import { info } from '$lib/logger';

listen('mcp/install', async (event: Event<MCPInstallEvent>) => {
    info('→ mcp/install');
    info(event);
    await goto(`/mcp-servers/install?config=${event.payload}`);
});
