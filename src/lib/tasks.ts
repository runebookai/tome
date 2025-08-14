import { Trigger } from '$lib/models';

export interface TaskMessage {
    name: 'tick';
}

export function triggerScheduledApps() {
    Trigger.scheduled
        .filter(trigger => trigger.shouldExecute())
        .forEach(trigger => trigger.app.execute());
}
