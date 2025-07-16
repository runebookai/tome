import { type Event } from '@tauri-apps/api/event';

import { listen } from '$events/registry';
import type { FileCreatedEvent, FilesystemEvent, FileUpdatedEvent } from '$events/types';
import { info } from '$lib/logger';
import { Trigger } from '$lib/models';

listen('filesystem/created', async (event: Event<FilesystemEvent<FileCreatedEvent>>) => {
    info('→ filesystem/created');
    await Trigger.find(event.payload.id).app.execute(event.payload);
});

listen('filesystem/updated', async (event: Event<FilesystemEvent<FileUpdatedEvent>>) => {
    info('→ filesystem/updated');
    await Trigger.find(event.payload.id).app.execute(event.payload);
});
