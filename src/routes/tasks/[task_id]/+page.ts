import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { Task } from '$lib/models';

export const load: PageLoad = async ({ params }): Promise<void> => {
    const task = Task.find(Number(params.task_id));
    goto(`/tasks/${params.task_id}/runs/${task.latestRun?.id}`);
};

export const prerender = true;
export const ssr = false;
