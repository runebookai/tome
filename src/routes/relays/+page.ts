import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { Relay } from '$lib/models';

export const load: PageLoad = async (): Promise<void> => {
    const relay = Relay.all()[0];
    await goto(relay ? `/relays/${relay.id}` : '/relays/new');
};

export const prerender = true;
export const ssr = false;
