import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { App } from '$lib/models';

export const load: PageLoad = async (): Promise<void> => {
    const app = App.nonReserved()[0];
    await goto(app ? `/apps/${app.id}` : '/apps/new');
};

export const prerender = true;
export const ssr = false;
