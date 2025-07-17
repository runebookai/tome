import {
    type EventCallback,
    type EventName,
    listen as tauriListen,
    type Options,
    type UnlistenFn,
} from '@tauri-apps/api/event';

import { info } from '$lib/logger';

let unlistens: Record<string, UnlistenFn> = {};

/**
 * Listen for an event
 */
export async function listen<T>(event: EventName, handler: EventCallback<T>, options?: Options) {
    if (!Object.keys(unlistens).includes(event)) {
        info(`[green]✔ listening for: [reset]${event}`);
        unlistens[event] = await tauriListen(event, handler, options);
    }
}

/**
 * Unregister and reset all event listeners
 */
export function unlistenAll() {
    info('[green]✔ clear all event listeners');
    Object.values(unlistens).forEach(fn => fn());
    unlistens = {};
}
