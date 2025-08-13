import { listen } from '$events/registry';
import type { Event, RelayEvent } from '$events/types';
import { info } from '$lib/logger';
import { Trigger } from '$lib/models';

listen('relay/post', async (event: Event<RelayEvent>) => {
    info('→ relay/post');
    await Trigger.find(event.payload.id).app.execute(event.payload);
});
