import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { isUpToDate } from '$lib/updates';

export const load: PageLoad = async (): Promise<void> => {
    if (await isUpToDate()) {
        await goto('/onboarding');
    } else {
        await goto('/update');
    }
};

export const prerender = true;
export const ssr = false;
