import { type Event, listen } from '@tauri-apps/api/event';

import type { FileCreatedEvent, FileUpdatedEvent } from './types';

import { Trigger } from '$lib/models';

listen('filesystem/created', async (event: Event<FileCreatedEvent>) => {
    await Trigger.where({ event: 'filesystem', action: 'created' })
        .mapBy('app')
        .awaitAll(async app => app.execute(event.payload));
});

listen('filesystem/updated', async (event: Event<FileUpdatedEvent>) => {
    await Trigger.where({ event: 'filesystem', action: 'updated' })
        .mapBy('app')
        .awaitAll(async app => app.execute(event.payload));
});
