import type { Mode } from 'highlight.js';
import moment from 'moment';

import { dispatch } from '$lib/dispatch';
import { info } from '$lib/logger';
import { Engine, Model, Session, Task, TaskRun } from '$lib/models';
import { State } from '$lib/models/task-run.svelte';

const TASK_APP_ID = 2;

/**
 * Starts the Task execution loop
 *
 * The loop checks every hour if there are any Tasks that need to be run
 * (because 1 hour is the most granular interval you can choose right now).
 *
 * It pins times to the beginning of each hour so that we don't introduce drift
 * into `nextRun` values.
 */
export function startTasksLoop() {
    // First enqueue the next tick at the beginning of the next hour.
    const start = moment.utc().startOf('hour');
    const nextHour = start.add(1, 'hour');
    const delay = nextHour.diff(moment.utc(), 'milliseconds');
    setTimeout(startTasksLoop, delay);

    // Run all Tasks that need to be run.
    Task.needsToRun().map(async (task: Task) => {
        info(`running Task: ${task.name}`);
        task.start();
    });
}

/**
 * Mark any stale `TaskRun`s as failed after a day.
 */
export async function cleanPendingTasks() {
    await Promise.all(TaskRun.stale().map(async run => await run.fail()));
}

/**
 * Execute a Task.
 */
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

    const run = await TaskRun.create({
        taskId: task.id,
        sessionId: session.id,
    });

    // Run without awaiting, so we can return immediately, render the UI,
    // and wait for result asynchronously.
    _execute(run, model);

    return run;
}

async function _execute(run: TaskRun, model: Model) {
    await run.session.start();

    await dispatch(run.session, model, run.task.prompt)
        .then(_ => {
            run.state = State.Success;
            run.save();
        })
        .catch(e => {
            run.state = State.Failure;
            run.stateReason = e.toString();
            run.save();
        });

    await run.session.stop();
}
