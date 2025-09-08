import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { Model } from '$lib/models';

export const load: PageLoad = async (): Promise<void> => {
    if (Model.count() == 0) {
        await goto('/onboarding/models');
    } else {
        await goto('/chat/latest');
    }
};

export const prerender = true;
export const ssr = false;
