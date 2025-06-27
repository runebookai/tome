import { dispatch } from './dispatch';
import { Engine, Session, Task, TaskRun } from './models';
import { State } from './models/task-run.svelte';

const TASK_APP_ID = 2;

export async function execute(task: Task): Promise<TaskRun | undefined> {
    if (!task.engineId || !task.model) {
        return;
    }

    const engine = Engine.find(task.engineId);
    const model = engine.models.find(m => m.id == task.model);

    if (!model) {
        return;
    }

    const session = await Session.create({
        appId: TASK_APP_ID,
        config: {
            engineId: task.engineId,
            model: task.model,
            enabledMcpServers: task.mcpServers.map(m => m.name),
        },
        ephemeral: true,
    });

    if (!session) {
        return;
    }

    task.mcpServers.forEach(async server => {
        await session.addMcpServer(server);
        await server.start(session);
    });

    const run = await TaskRun.create({
        taskId: task.id,
        sessionId: session.id,
    });

    dispatch(session, model, task.prompt)
        .then(_ => {
            run.state = State.Success;
            run.save();
        })
        .catch(_ => {
            run.state = State.Failure;
            run.save();
        });

    return run;
}
