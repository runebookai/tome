import { check, type Update } from '@tauri-apps/plugin-updater';

import { info } from './logger';

import Config, { SKIPPED_VERSIONS } from '$lib/config';

export async function availableUpdate(): Promise<Update | null> {
    return await check();
}

export async function isUpToDate(): Promise<boolean> {
    try {
        const update = await availableUpdate();
        const skipped = await Config.get(SKIPPED_VERSIONS) as unknown as string[];
        info('UPDATE', update);
        info('SKIPPED', skipped);

        if (!update) {
            return true;
        }

        if (skipped && skipped.includes(update.version)) {
            return true;
        }

        return false;
    } catch {
        // If something went wrong fetching available updates, just move on and
        // let the user continue with the current version.
        return true;
    }
}
