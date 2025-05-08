import { info } from '$lib/logger';
import App from '$lib/models/app';
import McpServer from '$lib/models/mcp-server';
import Message from '$lib/models/message';
import Model from '$lib/models/model.svelte';
import Session from '$lib/models/session';
import Setting from '$lib/models/setting';

export { default as App, type IApp } from '$lib/models/app';
export { type IMcpServer, default as McpServer } from '$lib/models/mcp-server';
export { type IMessage, default as Message } from '$lib/models/message';
export { type IModel, default as Model } from '$lib/models/model.svelte';
export { type ISession, default as Session } from '$lib/models/session';
export { type ISetting, default as Setting } from '$lib/models/setting';

export async function resync() {
    await App.sync();
    await Session.sync();
    await Message.sync();
    await McpServer.sync();
    await Setting.sync();
    await Model.sync();
    info('[green]✔ resynced');
}
