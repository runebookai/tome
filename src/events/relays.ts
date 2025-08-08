import type { Event, RelayEvent } from '$events/types';

import { Trigger } from '$lib/models';
import { info } from '$lib/logger';
import { listen } from '$events/registry';

listen('relay/post', async (event: Event<RelayEvent>) => {
    info('→ relay/post');
    await Trigger.find(event.payload.id).app.execute(event.payload);
});