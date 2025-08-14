import { type Event, listen } from '@tauri-apps/api/event';
import { goto } from '$app/navigation';

import type { MCPInstallEvent } from './types';

listen('mcp/install', async (event: Event<MCPInstallEvent>) => {
    await goto(`/mcp-servers/install?config=${event.payload.config}`);
});
