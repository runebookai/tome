import { invoke } from '@tauri-apps/api/core';

import { Session, type ToSqlRow } from '$lib/models';
import Base from '$lib/models/base.svelte';

interface Row {
    id: number;
    name: string;
    command: string;
    metadata: string;
    args: string;
    env: string;
    transport_type: string;
    transport_config: string;
}

interface Metadata {
    protocolVersion: string;
    capabilities: {
        tools: Record<string, any>; // eslint-disable-line
    };
    serverInfo: {
        name?: string;
        version: string;
    };
}

export interface TransportConfig {
    url?: string;
    authentication: {
        type: 'none' | 'bearer' | 'basic';
        token?: string;
        username?: string;
        password?: string;
    };
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
}

export default class McpServer extends Base<Row>('mcp_servers') {
    id?: number = $state();
    name: string = $state('Installing...');
    command: string = $state('');
    metadata?: Metadata = $state({} as Metadata);
    args: string[] = $state([]);
    env: Record<string, string> = $state({});
    transportType: string = $state('stdio');
    transportConfig: TransportConfig = $state({
        authentication: {
            type: 'none',
        },
    });

    get defaults() {
        return {
            name: 'Installing...',
            command: '',
            metadata: {
                protocolVersion: '',
                capabilities: {
                    tools: {},
                },
                serverInfo: {
                    name: undefined,
                    version: '',
                },
            },
            args: [],
            env: {},
            transportType: 'stdio',
            transportConfig: {
                authentication: {
                    type: 'none',
                },
            },
        };
    }

    static async forApp(appId: number): Promise<McpServer[]> {
        return await this.query(
            `
            SELECT
                *
            FROM
                mcp_servers
            WHERE
                id IN (SELECT mcp_server_id FROM apps_mcp_servers WHERE app_id = $1)
            `,
            [appId]
        );
    }

    async start(session: Session) {
        // Validate transport configuration before starting
        if (this.transportType === 'http') {
            if (!this.transportConfig?.url) {
                throw new Error(`HTTP transport requires a URL for server ${this.name}`);
            }
            
            // Validate URL format
            try {
                new URL(this.transportConfig.url);
            } catch (e) {
                throw new Error(`Invalid URL format for HTTP transport: ${this.transportConfig.url}`);
            }
        } else if (this.transportType === 'stdio') {
            if (!this.command) {
                throw new Error(`Stdio transport requires a command for server ${this.name}`);
            }
        }

        await invoke('start_mcp_server', {
            sessionId: session.id,
            command: this.command,
            args: this.args,
            env: this.env,
            transport_type: this.transportType,
            transport_config: this.transportConfig,
        });
    }

    async stop(session: Session) {
        await invoke('stop_mcp_server', {
            sessionId: session.id,
            name: this.name,
        });
    }

    get displayInfo(): string {
        if (this.transportType === 'http') {
            return `HTTP: ${this.transportConfig?.url || 'No URL configured'}`;
        } else {
            return `Stdio: ${this.command} ${this.args.join(' ')}`;
        }
    }

    get isConfigured(): boolean {
        if (this.transportType === 'http') {
            return !!(this.transportConfig?.url);
        } else {
            return !!(this.command);
        }
    }

    async beforeCreate(row: Row): Promise<ToSqlRow<Row>> {
        // Validate transport configuration before creation
        const transportConfig = JSON.parse(row.transport_config);
        
        if (row.transport_type === 'http') {
            if (!transportConfig?.url) {
                throw new Error('HTTP transport requires a URL');
            }
            
            // Validate URL format
            try {
                new URL(transportConfig.url);
            } catch (e) {
                throw new Error(`Invalid URL format: ${transportConfig.url}`);
            }
        } else if (row.transport_type === 'stdio') {
            if (!row.command) {
                throw new Error('Stdio transport requires a command');
            }
        }

        const metadata: Metadata = JSON.parse(
            await invoke('get_metadata', {
                command: row.command,
                args: JSON.parse(row.args),
                env: JSON.parse(row.env),
                transport_type: row.transport_type,
                transport_config: JSON.parse(row.transport_config),
            })
        );

        row.metadata = JSON.stringify(metadata);
        row.name = metadata.serverInfo?.name
            ?.replace('mcp-server/', '')
            ?.replace('/', '-') as string;

        return row;
    }

    static async fromSql(row: Row): Promise<McpServer> {
        const config = JSON.parse(row.transport_config);
        // Ensure authentication is always present
        if (!config.authentication) {
            config.authentication = { type: 'none' };
        }

        return McpServer.new({
            id: row.id,
            name: row.name,
            command: row.command,
            metadata: JSON.parse(row.metadata),
            args: JSON.parse(row.args),
            env: JSON.parse(row.env),
            transportType: row.transport_type,
            transportConfig: config,
        });
    }

    async toSql(): Promise<ToSqlRow<Row>> {
        return {
            name: this.name,
            command: this.command,
            metadata: JSON.stringify(this.metadata),
            args: JSON.stringify(this.args),
            env: JSON.stringify(this.env),
            transport_type: this.transportType,
            transport_config: JSON.stringify(this.transportConfig),
        };
    }

    async rename(newName: string) {
        const oldName = this.name;
        this.name = newName;
        await this.save();

        // Update the server name in any active sessions
        const sessions = Session.all();
        for (const session of sessions) {
            if (session.hasMcpServer(oldName)) {
                await invoke('rename_mcp_server', {
                    sessionId: session.id,
                    oldName,
                    newName,
                });
                session.config.enabledMcpServers = session.config.enabledMcpServers?.map(name =>
                    name === oldName ? newName : name
                );
                await session.save();
            }
        }
    }
}
