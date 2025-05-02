import '$lib/ext';

import type { ClientInit, HandleClientError } from "@sveltejs/kit";
import { goto } from '$app/navigation';

import { WELCOME_AGREED } from "$lib/const";
import Config from "$lib/config";
import { OllamaClient } from '$lib/llm';
import { info } from '$lib/logger';
import App from "$lib/models/app";
import McpServer from "$lib/models/mcp-server";
import Message from "$lib/models/message";
import Model from '$lib/models/model.svelte';
import Session from "$lib/models/session";
import Setting from "$lib/models/setting";
import startup, { StartupCheck } from "$lib/startup";

// App Initialization
export const init: ClientInit = async () => {
    info('initializing');

    await App.sync();
    await Session.sync();
    await Message.sync();
    await McpServer.sync();
    await Setting.sync();

    info('[green]✔ database synced');

    const client = new OllamaClient();

    await startup.addCheck(
        StartupCheck.Ollama,
        async () => await client.connected(),
    );

    await startup.addCheck(
        StartupCheck.MissingModels,
        async () => await client.hasModels(),
        async () => await Model.sync(),
    );

    await startup.addCheck(
        StartupCheck.Agreement,
        async () => await Config.get(WELCOME_AGREED) === true,
    );
}

export const handleError: HandleClientError = async () => {
    goto('/error');
}
