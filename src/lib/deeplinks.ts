import { listen } from "@tauri-apps/api/event";
import { goto } from "$app/navigation";

import type { InstallMcpServerPayload } from '$lib/deeplinks.d';

export * from '$lib/deeplinks.d';

export enum DeepLinks {
    InstallMcpServer = 'install-mcp-server',
}

export function setupDeeplinks() {
    listen<InstallMcpServerPayload>(DeepLinks.InstallMcpServer, event => {
        goto(`/mcp-servers/install?payload=${event.payload}`);
    });
}
