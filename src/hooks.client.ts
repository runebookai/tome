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
import { setupDeeplinks } from '$lib/deeplinks';
import { error } from '$lib/logger';
import { info } from '$lib/logger';
import { resync } from '$lib/models';
import Config from '$lib/models/config.svelte';
import Engine from '$lib/models/engine.svelte';
import startup, { StartupCheck } from '$lib/startup';
import { isUpToDate } from '$lib/updates';
import { spawn } from '$lib/web-workers';
import Relay from '$lib/workers/relays?url';
import Scheduler from '$lib/workers/tasks?url';

// App Initialization
export const init: ClientInit = async () => {
    info('initializing');

    setupDeeplinks();
    info('[green]✔ deeplinks subscribed');

    await resync();
    info('[green]✔ database synced');

    spawn(Scheduler);
    info('[green]✔ scheduler started');

    spawn(Relay);
    info('[green]✔ relays started');

    await listen();
    await apps.watch();

    await startup.addCheck(StartupCheck.Agreement, async () => Config.agreedToWelcome);
    await startup.addCheck(StartupCheck.UpdateAvailable, async () => await isUpToDate());
    await startup.addCheck(
        StartupCheck.NoModels,
        async () => Engine.all().flatMap(e => e.models).length > 0
    );
};

export const handleError: HandleClientError = async ({ error: err }) => {
    error(err);
    goto('/error');
};
