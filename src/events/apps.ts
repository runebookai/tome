import type { Event } from '@tauri-apps/api/event';
import { goto } from '$app/navigation';

import { listen } from '$events/registry';
import { info } from '$lib/logger';

listen('apps/import', async (event: Event<string>) => {
    info('→ apps/import');
    info(event);
    await goto(`/apps/import?${event.payload}`);
});
