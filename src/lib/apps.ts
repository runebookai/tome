import { invoke } from '@tauri-apps/api/core';

import { dispatch } from '$lib/dispatch';
import { info } from '$lib/logger';
import { App, AppRun, AppStep, Model, Session, Trigger } from '$lib/models';
import type { FilesystemConfig } from '$lib/models/trigger.svelte';

// eslint-disable-next-line
export async function execute(app: App, input: any = undefined): Promise<AppRun> {
    info(`executing app: ${app.name}`);

    const session = await Session.create({
        appId: app.id,
        ephemeral: true,
        config: {
            engineId: app.steps[0].engineId,
            model: app.steps[0].model,
            enabledMcpServers: app.mcpServers.map(m => m.name),
        },
    });

    if (input) {
        session.addMessage(input);
    }

    const run = await AppRun.create({
        appId: app.id,
        sessionId: session.id,
    });

    asyncExecute(app, session)
        .then(_ => run.succeed())
        .catch(e => run.fail(e.toString()));

    return run;
}
/**
 * Watch all events for all Apps
 */
export async function watch() {
    await watchFilesystem();
}

/**
 * Start all watchers for Filesystem apps.
 */
export async function watchFilesystem() {
    await Trigger.where({ event: 'filesystem' }).awaitAll(async trigger => {
        const config = trigger.config as FilesystemConfig;

        if (!config || !config.path) {
            return;
        }

        await invoke('watch', { path: config.path });
        info(`[green]✔ watch: [reset]${config.path}`);
    });
}

async function asyncExecute(app: App, session: Session) {
    await session.start();

    for (const step of app.steps) {
        await executeStep(step, session);
    }
}

async function executeStep(step: AppStep, session: Session) {
    const model = Model.findBy({ engineId: step.engineId, id: step.model });

    if (!model) {
        throw 'MissingModelError';
    }

    await dispatch(session, model, step.prompt);
}
