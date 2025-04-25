import { invoke } from "@tauri-apps/api/core";

import type { ISession } from "./session";

import Model, { type ToSqlRow } from '$lib/models/base.svelte';

export interface IMcpServer {
    id?: number;
    command: string;
    metadata?: Metadata;
}

interface Row {
    id: number;
    command: string;
    metadata: string;
}

interface Metadata {
    protocolVersion: string;
    capabilities: {
        tools: Record<string, any>; // eslint-disable-line
    }
    serverInfo: {
        name?: string;
        version: string;
    }
}

export default class McpServer extends Model<IMcpServer, Row>('mcp_servers') {
    static default(): IMcpServer {
        return {
            command: '',
            metadata: {
                protocolVersion: '',
                capabilities: {
                    tools: {},
                },
                serverInfo: {
                    name: undefined,
                    version: '',
                }
            },
        }
    }

    static async forApp(appId: number): Promise<IMcpServer[]> {
        return await this.query(
            'SELECT * FROM mcp_servers WHERE id IN (SELECT mcp_server_id FROM apps_mcp_servers WHERE app_id = $1)',
            [appId],
        );
    }

    static name(server: IMcpServer): string {
        return server.metadata?.serverInfo.name || 'Unknown';
    }

    static async start(server: IMcpServer, session: ISession) {
        await invoke('start_mcp_server', {
            sessionId: session.id,
            command: server.command,
        });
    }

    static async stop(server: IMcpServer, session: ISession) {
        await invoke('stop_mcp_server', {
            sessionId: session.id,
            name: McpServer.name(server),
        });
    }

    static async afterCreate(server: IMcpServer): Promise<IMcpServer> {
        const metadata: Metadata = JSON.parse(
            await invoke('get_metadata', { command: server.command })
        );

        return await this.update({
            ...server,
            metadata,
        });
    }

    static async fromSql(row: Row): Promise<IMcpServer> {
        return {
            id: row.id,
            command: row.command,
            metadata: JSON.parse(row.metadata),
        };
    }

    static async toSql(server: IMcpServer): Promise<ToSqlRow<Row>> {
        return {
            command: server.command,
            metadata: JSON.stringify(server.metadata),
        }
    }
}
