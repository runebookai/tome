import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { Task } from '$lib/models';

export const load: PageLoad = async (): Promise<void> => {
    const task = Task.first();

    if (task) {
        await goto(`/tasks/${task.id}`);
    } else {
        await goto(`/tasks/new`);
    }
};

export const prerender = true;
export const ssr = false;
