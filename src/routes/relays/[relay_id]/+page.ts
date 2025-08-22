import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }): Promise<void> => {
    goto(`/relays/${params.relay_id}/edit`);
};

export const prerender = true;
export const ssr = false;
