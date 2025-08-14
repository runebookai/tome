import type { PageLoad } from './$types';
import { goto } from '$app/navigation';

export const load: PageLoad = async ({ params }): Promise<void> => {
    goto(`/relays/${params.relay_id}/edit`);
};

export const prerender = true;
export const ssr = false;
