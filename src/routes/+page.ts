import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

export const load: PageLoad = async (): Promise<void> => {
    await goto('/onboarding');
};

export const prerender = true;
export const ssr = false;
