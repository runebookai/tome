import type { PageLoad } from './$types';

import type { CompactServer } from '$lib/smithery';
import { Client } from '$lib/smithery/client';

interface Response {
    servers: CompactServer[];
}

export const load: PageLoad = async (): Promise<Response> => {
    const client = new Client();

    return {
        servers: await client.servers(),
    }
}
