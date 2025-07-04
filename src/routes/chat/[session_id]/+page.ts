import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { CHAT_APP_ID } from '$lib/const';
import Config from '$lib/models/config.svelte';
import Model from '$lib/models/model.svelte';
import Session from '$lib/models/session.svelte';

export const load: PageLoad = async ({ params }): Promise<void> => {
    await Model.sync();

    if (params.session_id == 'new') {
        const session = await Session.create({ appId: CHAT_APP_ID });
        await goto(`/chat/${session.id}`);
    } else if (params.session_id == 'latest') {
        let session = Session.find(Number(Config.latestSessionId));
        session ||= Session.last();
        session ||= await Session.create({ appId: CHAT_APP_ID });
        await goto(`/chat/${session.id}`);
    }

    if (Session.exists({ id: Number(params.session_id) })) {
        Config.latestSessionId = Number(params.session_id);
    }
};

export const prerender = true;
export const ssr = false;
