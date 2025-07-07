import { Trigger } from '$lib/models';
import { command } from '$lib/web-workers';

interface TickMessage {
    name: 'tick';
}

command<TickMessage>(function tick(_: TickMessage) {
    Trigger.scheduled
        .filter(trigger => trigger.shouldExecute())
        .forEach(trigger => trigger.app.execute());
});
