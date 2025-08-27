import { invoke } from '@tauri-apps/api/core';
import uuid4 from 'uuid4';

import Redactable from './redaction.svelte';

import { dispatch } from '$lib/dispatch';
import { info } from '$lib/logger';
import { App, AppRun, AppStep, McpServer, Model, Session, Trigger } from '$lib/models';
import type { AmbientAction, AmbientEvent, FilesystemConfig } from '$lib/models/trigger.svelte';

export interface SerializedApp {
    name: string;
    readme: string;
    trigger: SerializedTrigger;
    steps: SerializedAppStep[];
    mcp_servers: SerializedMcpServer[];
}

export interface SerializedTrigger {
    event: string;
    action: string;
    config: Record<string, unknown>;
}

export interface SerializedAppStep {
    model: string;
    prompt: string;
}

export interface SerializedMcpServer {
    name: string;
    command: string;
    args: Array<Redactable>;
    env: Record<string, Redactable>;
}

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

function redact(...values: string[]): Redactable[] {
    return values.map(value => new Redactable(value, uuid4.valid(value)));
}

export async function install(serializedApp: SerializedApp): Promise<App> {
    const app = await App.create({
        name: serializedApp.name,
        readme: serializedApp.readme,
    });

    await Trigger.create({
        appId: app.id,
        event: serializedApp.trigger.event as AmbientEvent,
        action: serializedApp.trigger.action as AmbientAction,
        config: serializedApp.trigger.config,
    });

    for (const step of serializedApp.steps) {
        const model = Model.find(step.model);

        await AppStep.create({
            appId: app?.id,
            modelId: model?.id,
            engineId: model?.engineId,
            prompt: step.prompt,
        });
    }

    for (const server of serializedApp.mcp_servers) {
        app.addMcpServer(
            await McpServer.create({
                name: server.name,
                command: server.command,
                args: server.args.map(a => a.toString()),
                env: Object.fromEntries(
                    Object.entries(server.env).map(([k, v]) => [k.toString(), v.toString()])
                ),
            })
        );
    }

    return app;
}

/**
 * Serialize an App into a portable JSON object used to share with other
 * users.
 */
export function serialize(app: App): SerializedApp {
    return {
        name: app.name,
        readme: app.readme,

        trigger: {
            event: app.trigger.event,
            action: app.trigger.action,
            config: { ...app.trigger.config },
        },

        steps: app.steps.map(step => ({
            model: step.model?.id as string,
            prompt: step.prompt,
        })),

        mcp_servers: app.mcpServers.map(server => ({
            name: server.name,
            command: server.command,
            args: redact(...server.args),
            env: Object.fromEntries(Object.entries(server.env).map(values => redact(...values))),
        })),
    };
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
