import { invoke } from '@tauri-apps/api/core';

import { dispatch } from '$lib/dispatch';
import { info } from '$lib/logger';
import { App, AppRun, AppStep, Session, Trigger } from '$lib/models';
import type { FilesystemConfig } from '$lib/models/trigger.svelte';

/**
 * Watch all events for all Apps
 */
export async function watch() {
    await initializeBackendWatchers();
}
/**
 * Start all watchers for Filesystem apps.
 */
export async function initializeBackendWatchers() {
    await Trigger.where({ event: 'filesystem' }).awaitAll(async trigger => {
        const config = trigger.config as FilesystemConfig;
        const path = config.path;

        if (!config || !path) {
            return;
        }

        await invoke('watch', { path, id: trigger.id });
        info(`[green]✔ watch: [reset]${path}`);
    });
}

/**
 * Execute an App.
 *
 * This function executes the App in the "background" and returns the `AppRun`
 * immediately. This allows us to render the `Session` immediately and the user
 * sees messages as they are created.
 *
 * @param app App to run
 * @param [input=undefined] Input data formatted as a message for an LLM
 */
export async function execute(app: App, input?: object): Promise<AppRun> {
    info(`executing app: ${app.name}`);

    const session = await Session.create({
        appId: app.id,
        ephemeral: true,
        config: {
            engineId: app.steps[0].engineId,
            model: app.steps[0].modelId,
            enabledMcpServers: app.mcpServers.map(m => m.name),
        },
    });

    if (input) {
        session.addMessage({
            role: 'system',
            content: `Use the following JSON as context for future queries:\n\n\`\`\`${JSON.stringify(input)}\`\`\``,
        });
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
 * Asynchronously execute an App
 *
 * This is a separate function so that we can call it _without_ `await`. That
 * way it can execute in the "background".
 *
 * @param app App to execute
 * @param session `Session` to associate `Message`s with
 */
async function asyncExecute(app: App, session: Session) {
    await session.start();

    for (const step of app.steps) {
        await executeStep(step, session);
    }
}

/**
 * Execute an individual `AppStep`
 *
 * Dispatches the step's `prompt` to the configured LLM.
 *
 * @param step `AppStep` being executed
 * @param session `Session` to associate `Message`s to
 */
async function executeStep(step: AppStep, session: Session) {
    if (!step.model) {
        throw 'MissingModelError';
    }

    await dispatch(session, step.model, step.prompt);
}
