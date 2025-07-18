import { check, type Update } from '@tauri-apps/plugin-updater';

import { Config } from '$lib/models';

export async function availableUpdate(): Promise<Update | null> {
    return await check();
}

export async function isUpToDate(): Promise<boolean> {
    try {
        const update = await availableUpdate();

        if (!update) {
            return true;
        }

        if (Config.skippedVersions && Config.skippedVersions.includes(update.version)) {
            return true;
        }

        return false;
    } catch {
        // If something went wrong fetching available updates, just move on and
        // let the user continue with the current version.
        return true;
    }
}
