import { goto } from '$app/navigation';

import type { PageLoad } from './$types';

import { CHAT_APP_ID } from '$lib/const';
import config from '$lib/config';
import Session from '$lib/models/session';

export const load: PageLoad = async ({ params }): Promise<void> => {
    if (params.session_id == 'new') {
        const session = await Session.create({ appId: CHAT_APP_ID });
        await goto(`/chat/${session.id}`);

    } else if (params.session_id == 'latest') {
        let session = Session.find(await config.get('latest-session-id'));
        session ||= Session.last();
        session ||= await Session.create({ appId: CHAT_APP_ID });
        await goto(`/chat/${session.id}`);
    }

    if (Session.exists({ id: Number(params.session_id) })) {
        config.set('latest-session-id', params.session_id);
    }
}

export const prerender = true;
export const ssr = false;
