import { dispatch } from './dispatch';

import { App, AppRun, AppStep, Model, Session } from '$lib/models';

// eslint-disable-next-line
export async function execute(app: App, input: any = undefined): Promise<AppRun> {
    const session = await Session.create({
        appId: app.id,
        ephemeral: true,
        config: {
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
