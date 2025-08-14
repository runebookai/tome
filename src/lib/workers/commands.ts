import { poll, type RelayMessage } from '$lib/relays';
import { type TaskMessage, triggerScheduledApps } from '$lib/tasks';
import { command } from '$lib/web-workers';

/**
 * Commands that can be invoked from Web Workers
 */

command<TaskMessage>('tick', (_: TaskMessage) => {
    triggerScheduledApps();
});

command<RelayMessage>('relay', (_: RelayMessage) => {
    poll();
});
