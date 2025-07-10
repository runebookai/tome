import { type Event, listen } from '@tauri-apps/api/event';

import type { FileCreatedEvent, FileUpdatedEvent } from './types';

import { Trigger } from '$lib/models';

listen('filesystem/file-created', async (event: Event<FileCreatedEvent>) => {
    await Trigger.where({ event: 'filesystem', action: 'file_created' })
        .mapBy('app')
        .awaitAll(async app => app.execute(event.payload));
});

listen('filesystem/file-updated', async (event: Event<FileUpdatedEvent>) => {
    await Trigger.where({ event: 'filesystem', action: 'file_updated' })
        .mapBy('app')
        .awaitAll(async app => app.execute(event.payload));
});
