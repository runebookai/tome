import '$lib/ext';

import type { ClientInit, HandleClientError } from "@sveltejs/kit";
import { goto } from '$app/navigation';

import { WELCOME_AGREED } from "$lib/const";
import Config from "$lib/config";
import { setupDeeplinks } from '$lib/deeplinks';
import { info } from '$lib/logger';
import App from "$lib/models/app";
import Engine from '$lib/models/engine';
import McpServer from "$lib/models/mcp-server";
import Message from "$lib/models/message";
import Session from "$lib/models/session";
import Setting from "$lib/models/setting";
import startup, { StartupCheck } from "$lib/startup";
import { isUpToDate } from '$lib/updates';

// App Initialization
export const init: ClientInit = async () => {
    info('initializing');

    setupDeeplinks();
    info('[green]✔ deeplinks subscribed');

    await App.sync();
    await Session.sync();
    await Message.sync();
    await McpServer.sync();
    await Setting.sync();
    await Engine.sync();
    info('[green]✔ database synced');

    await startup.addCheck(
        StartupCheck.Agreement,
        async () => await Config.get(WELCOME_AGREED) === true,
    );

    await startup.addCheck(
        StartupCheck.UpdateAvailable,
        async () => await isUpToDate(),
    );
}

export const handleError: HandleClientError = async () => {
    goto('/error');
}
