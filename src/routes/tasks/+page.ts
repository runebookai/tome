import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { Task } from '$lib/models';

export const load: PageLoad = async (): Promise<void> => {
    goto(`/tasks/${Task.first().id}`);
};

export const prerender = true;
export const ssr = false;
