import { type TaskMessage, triggerScheduledApps } from '$lib/tasks';
import { command } from '$lib/web-workers';

/**
 * Commands that can be invoked from Web Workers
 */

command<TaskMessage>(function tick(_: TaskMessage) {
    triggerScheduledApps();
});
