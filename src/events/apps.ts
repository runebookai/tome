import type { Event } from '@tauri-apps/api/event';
import { goto } from '$app/navigation';

import { listen } from '$events/registry';
import type { AppInstallEvent } from '$events/types';
import { info } from '$lib/logger';

listen('apps/import', async (event: Event<AppInstallEvent>) => {
    info('→ apps/import');
    console.log(event);
    await goto(`/apps/import?hash=${event.payload.hash}`);
});
