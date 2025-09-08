// Javascript stdlib extensions
import '$lib/ext';
// Commands invokable from web workers
import '$lib/workers/commands';
// Event Handlers
import '$events';

import type { ClientInit, HandleClientError } from '@sveltejs/kit';
import { goto } from '$app/navigation';

import { listen } from '$events';
import * as apps from '$lib/apps';
import { error } from '$lib/logger';
import { info } from '$lib/logger';
import { resync } from '$lib/models';
import { startActiveRelays } from '$lib/relays';
import startup, { StartupCheck } from '$lib/startup';
import { isUpToDate } from '$lib/updates';
import { spawn } from '$lib/web-workers';
import Relay from '$lib/workers/relays?worker';
import Scheduler from '$lib/workers/tasks?worker';

// App Initialization
export const init: ClientInit = async () => {
    info('initializing');

    await resync();
    info('[green]✔ database synced');

    await startActiveRelays();

    spawn(new Scheduler());
    spawn(new Relay());

    await listen();
    await apps.watch();

    await startup.addCheck(StartupCheck.UpdateAvailable, async () => await isUpToDate());
};

export const handleError: HandleClientError = async ({ error: err }) => {
    error(err);
    goto('/error');
};
