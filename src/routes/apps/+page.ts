import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { App } from '$lib/models';

export const load: PageLoad = async (): Promise<void> => {
    //const task = App.first();

    //if (task) {
    //    await goto(`/apps/${task.id}`);
    //} else {
    await goto(`/apps/new`);
    //}
};

export const prerender = true;
export const ssr = false;
