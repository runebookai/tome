import { invoke } from '@tauri-apps/api/core';

import type { ISession } from './session';

import Model, { type ToSqlRow } from '$lib/models/base.svelte';

export interface IMcpServer {
    id?: number;
    name: string;
    command: string;
    metadata?: Metadata;
    args: string[];
    env: Record<string, string>;
}

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

export default class McpServer extends Model<IMcpServer, Row>('mcp_servers') {
    static defaults = {
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

    static async forApp(appId: number): Promise<IMcpServer[]> {
        return await this.query(
            'SELECT * FROM mcp_servers WHERE id IN (SELECT mcp_server_id FROM apps_mcp_servers WHERE app_id = $1)',
            [appId]
        );
    }

    static async start(server: IMcpServer, session: ISession) {
        await invoke('start_mcp_server', {
            sessionId: session.id,
            command: server.command,
            args: server.args,
            env: server.env,
        });
    }

    static async stop(server: IMcpServer, session: ISession) {
        await invoke('stop_mcp_server', {
            sessionId: session.id,
            name: server.name,
        });
    }

    static async afterCreate(server: IMcpServer): Promise<IMcpServer> {
        const metadata: Metadata = JSON.parse(
            await invoke('get_metadata', {
                command: server.command,
                args: server.args,
                env: server.env,
            })
        );

        const name = metadata.serverInfo?.name
            ?.replace('mcp-server/', '')
            ?.replace('/', '-') as string;

        return await this.update({
            ...server,
            name,
            metadata,
        });
    }

    static async fromSql(row: Row): Promise<IMcpServer> {
        return {
            id: row.id,
            name: row.name,
            command: row.command,
            metadata: JSON.parse(row.metadata),
            args: JSON.parse(row.args),
            env: JSON.parse(row.env),
        };
    }

    static async toSql(server: IMcpServer): Promise<ToSqlRow<Row>> {
        return {
            name: server.name,
            command: server.command,
            metadata: JSON.stringify(server.metadata),
            args: JSON.stringify(server.args),
            env: JSON.stringify(server.env),
        };
    }
}
