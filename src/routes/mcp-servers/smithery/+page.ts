import type { PageLoad } from './$types';

import { Client } from '$lib/smithery/client';
import type { CompactServer } from '$lib/smithery/types';

interface Response {
    servers: CompactServer[];
}

export const load: PageLoad = async (): Promise<Response> => {
    const client = new Client();

    return {
        servers: await client.servers(),
    };
};
