import { listen } from '@tauri-apps/api/event';
import { goto } from '$app/navigation';

export interface VSCodeMcpInstallConfig {
    name: string;
    type: string;
    command: string;
    args: string[];
}

export enum DeepLinks {
    InstallMcpServer = 'mcp/install',
}

export function setupDeeplinks() {
    listen<string>(DeepLinks.InstallMcpServer, async event => {
        goto(`/mcp-servers/install?config=${event.payload}`);
    });
}
