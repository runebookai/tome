import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { App } from '$lib/models';

export const load: PageLoad = async ({ params }): Promise<void> => {
    const app = App.find(Number(params.app_id));
    goto(`/apps/${params.app_id}/runs/${app.latestRun?.id}`);
};

export const prerender = true;
export const ssr = false;
