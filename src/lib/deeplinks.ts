import { listen } from '@tauri-apps/api/event';
import { goto } from '$app/navigation';

export interface VSCodeMcpInstallConfig {
    name: string;
    type: string;
    command: string;
    args: string[];
    // HTTP transport specific fields
    url?: string;
    transport?: 'stdio' | 'http';
    authentication?: {
        type: 'none' | 'bearer' | 'basic';
        token?: string;
        username?: string;
        password?: string;
    };
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
}

export enum DeepLinks {
    InstallMcpServer = 'mcp/install',
}

export function setupDeeplinks() {
    listen<string>(DeepLinks.InstallMcpServer, async event => {
        const config = parseDeepLinkConfig(event.payload);
        const configParam = encodeURIComponent(JSON.stringify(config));
        goto(`/mcp-servers/install?config=${configParam}`);
    });
}

// Parse deep link query parameters into VSCodeMcpInstallConfig
function parseDeepLinkConfig(query: string): VSCodeMcpInstallConfig {
    const params = new URLSearchParams(query);

    const name = params.get('name');
    const transport = (params.get('transport') as 'stdio' | 'http') || 'stdio';
    const url = params.get('url');
    const command = params.get('command');
    const args = params.get('args');

    if (!name) {
        throw new Error('Missing required parameter: name');
    }

    if (transport === 'http') {
        if (!url) {
            throw new Error('HTTP transport requires url parameter');
        }

        const config: VSCodeMcpInstallConfig = {
            name,
            type: 'http',
            transport: 'http',
            url,
            command: '', // Not used for HTTP transport
            args: [], // Not used for HTTP transport
            authentication: {
                type: 'none',
            },
        };

        // Parse authentication if provided
        const authType = params.get('auth_type') as 'none' | 'bearer' | 'basic';
        if (authType) {
            config.authentication = {
                type: authType,
                token: params.get('auth_token') || undefined,
                username: params.get('auth_username') || undefined,
                password: params.get('auth_password') || undefined,
            };
        }

        // Parse headers if provided
        const headers: Record<string, string> = {};
        for (const [key, value] of params.entries()) {
            if (key.startsWith('header_')) {
                const headerName = key.substring(7); // Remove 'header_' prefix
                headers[headerName] = value;
            }
        }
        if (Object.keys(headers).length > 0) {
            config.headers = headers;
        }

        // Parse optional timeout and retries
        const timeout = params.get('timeout');
        if (timeout) {
            config.timeout = parseInt(timeout, 10);
        }

        const retries = params.get('retries');
        if (retries) {
            config.retries = parseInt(retries, 10);
        }

        return config;
    } else {
        // Default to stdio transport for backward compatibility
        if (!command) {
            throw new Error('Stdio transport requires command parameter');
        }

        return {
            name,
            type: 'stdio',
            transport: 'stdio',
            command,
            args: args ? JSON.parse(args) : [],
            url: undefined,
        };
    }
}
