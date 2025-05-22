import moment from 'moment';

import Model, { type ToSqlRow } from '$lib/models/base.svelte';
import McpServer, { type IMcpServer } from '$lib/models/mcp-server';

export interface IApp {
    id?: number;
    name: string;
    description: string;
    readme: string;
    image: string;
    interface: Interface;
    nodes: Node[];
    mcpServers: IMcpServer[];
    created?: moment.Moment;
    modified?: moment.Moment;
}

interface Row {
    id: number;
    name: string;
    description: string;
    readme: string;
    image: string;
    interface: string;
    nodes: string;
    created: string;
    modified: string;
}

export interface Node {
    uuid: string;
    type: NodeType;
    config: { [key: string]: any }; // eslint-disable-line
}

export enum NodeType {
    Context = 'Context',
}

export enum Interface {
    Voice = 'Voice',
    Chat = 'Chat',
    Dashboard = 'Dashboard',
    Daemon = 'Daemon',
}

export default class App extends Model<IApp, Row>('apps') {
    static defaults = {
        name: 'Unknown',
        description: '',
        readme: '',
        image: '',
        interface: Interface.Chat,
        nodes: [],
        mcpServers: [],
    };

    static hasContext(app: IApp): boolean {
        return app.nodes?.find((n) => n.type == NodeType.Context) !== undefined;
    }

    static context(app: IApp): string {
        return app.nodes
            .filter((n) => n.type == NodeType.Context)
            .map((n) => n.config.value)
            .join('\n\n');
    }

    static addNode(app: IApp, node: Node): IApp {
        app.nodes.push(node);
        return app;
    }

    static removeNode(app: IApp, node: Node): IApp {
        app.nodes = app.nodes.filter((n) => n.uuid !== node.uuid);
        return app;
    }

    static async addMcpServer(app: IApp, mcpServer: IMcpServer): Promise<IMcpServer[]> {
        const result = await (
            await this.db()
        ).execute(`INSERT INTO apps_mcp_servers (app_id, mcp_server_id) VALUES ($1, $2)`, [
            app.id,
            mcpServer.id,
        ]);

        if (result.rowsAffected == 1) {
            app.mcpServers.push(mcpServer);
            return app.mcpServers;
        }

        throw 'AddMcpServerError';
    }

    static async removeMcpServer(app: IApp, mcpServer: IMcpServer): Promise<IMcpServer[]> {
        const result = await (
            await this.db()
        ).execute('DELETE FROM apps_mcp_servers WHERE app_id = $1 AND mcp_server_id = $2', [
            app.id,
            mcpServer.id,
        ]);

        if (result.rowsAffected == 1) {
            app.mcpServers = app.mcpServers.filter((m) => m.id == mcpServer.id);
            return app.mcpServers;
        }

        throw 'RemoveMcpServerError';
    }

    protected static async fromSql(row: Row): Promise<IApp> {
        return {
            ...row,
            interface: Interface[row.interface as keyof typeof Interface],
            nodes: JSON.parse(row.nodes),
            mcpServers: await McpServer.forApp(row.id),
            created: moment.utc(row.created),
            modified: moment.utc(row.modified),
        };
    }

    protected static async toSql(app: IApp): Promise<ToSqlRow<Row>> {
        return {
            name: app.name,
            description: app.description,
            readme: app.readme,
            image: app.image,
            interface: app.interface,
            nodes: JSON.stringify(app.nodes),
        };
    }
}
