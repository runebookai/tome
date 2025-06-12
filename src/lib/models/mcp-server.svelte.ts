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

export default class McpServer extends Base<Row>('mcp_servers') {
    id?: number = $state();
    name: string = $state('Installing...');
    command: string = $state('');
    metadata?: Metadata = $state({} as Metadata);
    args: string[] = $state([]);
    env: Record<string, string> = $state({});

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
        await invoke('start_mcp_server', {
            sessionId: session.id,
            command: this.command,
            args: this.args,
            env: this.env,
        });
    }

    async stop(session: Session) {
        await invoke('stop_mcp_server', {
            sessionId: session.id,
            name: this.name,
        });
    }

    async beforeCreate(row: Row): Promise<ToSqlRow<Row>> {
        const metadata: Metadata = JSON.parse(
            await invoke('get_metadata', {
                command: row.command,
                args: JSON.parse(row.args),
                env: JSON.parse(row.env),
            })
        );

        row.metadata = JSON.stringify(metadata);
        row.name = metadata.serverInfo?.name
            ?.replace('mcp-server/', '')
            ?.replace('/', '-') as string;

        return row;
    }

    static async fromSql(row: Row): Promise<McpServer> {
        return McpServer.new({
            id: row.id,
            name: row.name,
            command: row.command,
            metadata: JSON.parse(row.metadata),
            args: JSON.parse(row.args),
            env: JSON.parse(row.env),
        });
    }

    async toSql(): Promise<ToSqlRow<Row>> {
        return {
            name: this.name,
            command: this.command,
            metadata: JSON.stringify(this.metadata),
            args: JSON.stringify(this.args),
            env: JSON.stringify(this.env),
        };
    }

    async rename(newName: string) {
        const oldName = this.name;
        this.name = newName;
        await this.save();
        
        // Update the server name in any active sessions
        const sessions = await Session.all();
        for (const session of sessions) {
            if (session.hasMcpServer(oldName)) {
                await invoke('rename_mcp_server', {
                    sessionId: session.id,
                    oldName,
                    newName
                });
                session.config.enabledMcpServers = session.config.enabledMcpServers?.map(
                    name => name === oldName ? newName : name
                );
                await session.save();
            }
        }
    }
}
