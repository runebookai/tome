import { invoke } from '@tauri-apps/api/core';

export * from './types';

/**
 * Register event listeners for all events
 */
export async function listen() {
    await invoke('unwatch_all');
    await import('./filesystem');
    await import('./mcp');
    await import('./apps');
}
