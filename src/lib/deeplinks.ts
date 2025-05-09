import { listen } from "@tauri-apps/api/event";
import { goto } from "$app/navigation";

export * from '$lib/deeplinks.d';

export enum DeepLinks {
    InstallMcpServer = 'mcp/install',
}

export function setupDeeplinks() {
    listen<string>(DeepLinks.InstallMcpServer, async (event) => {
        goto(`/mcp-servers/install?config=${event.payload}`);
    });
}
