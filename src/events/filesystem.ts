import { listen } from '$events/registry';
import type { Event, FileCreatedEvent, FileUpdatedEvent } from '$events/types';
import { info } from '$lib/logger';
import { Trigger } from '$lib/models';

listen('filesystem/created', async (event: Event<FileCreatedEvent>) => {
    info('→ filesystem/created');
    await Trigger.find(event.payload.id).app.execute(event.payload);
});

listen('filesystem/updated', async (event: Event<FileUpdatedEvent>) => {
    info('→ filesystem/updated');
    await Trigger.find(event.payload.id).app.execute(event.payload);
});
