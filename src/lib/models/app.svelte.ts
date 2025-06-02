import moment from 'moment';

import { McpServer, type ToSqlRow } from '$lib/models';
import Base from '$lib/models/base.svelte';

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

export default class App extends Base<Row>('apps') {
    id?: number = $state();
    name: string = $state('Unknown');
    description: string = $state('');
    readme: string = $state('');
    image: string = $state('');
    interface: Interface = $state(Interface.Chat);
    nodes: Node[] = $state([]);
    mcpServers: McpServer[] = $state([]);
    created?: moment.Moment = $state();
    modified?: moment.Moment = $state();

    get defaults() {
        return {
            name: 'Unknown',
            description: '',
            readme: '',
            image: '',
            interface: Interface.Chat,
            nodes: [],
            mcpServers: [],
        };
    }

    get context() {
        return this.nodes
            .filter(n => n.type == NodeType.Context)
            .map(n => n.config.value)
            .join('\n\n');
    }

    hasContext(): boolean {
        return this.nodes.find(n => n.type == NodeType.Context) !== undefined;
    }

    addNode(node: Node) {
        this.nodes.push(node);
    }

    removeNode(node: Node) {
        this.nodes = this.nodes.filter(n => n.uuid !== node.uuid);
    }

    async addMcpServer(server: McpServer) {
        const result = await (
            await this.db()
        ).execute(`INSERT INTO apps_mcp_servers (app_id, mcp_server_id) VALUES ($1, $2)`, [
            this.id,
            server.id,
        ]);

        if (result.rowsAffected == 1) {
            this.mcpServers.push(server);
            return;
        }

        throw 'AddMcpServerError';
    }

    async removeMcpServer(server: McpServer) {
        const result = await (
            await this.db()
        ).execute('DELETE FROM apps_mcp_servers WHERE app_id = $1 AND mcp_server_id = $2', [
            this.id,
            server.id,
        ]);

        if (result.rowsAffected == 1) {
            this.mcpServers = this.mcpServers.filter(m => m.id == server.id);
            return;
        }

        throw 'RemoveMcpServerError';
    }

    protected static async fromSql(row: Row): Promise<App> {
        return App.new({
            ...row,
            interface: Interface[row.interface as keyof typeof Interface],
            nodes: JSON.parse(row.nodes),
            mcpServers: await McpServer.forApp(row.id),
            created: moment.utc(row.created),
            modified: moment.utc(row.modified),
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            name: this.name,
            description: this.description,
            readme: this.readme,
            image: this.image,
            interface: this.interface,
            nodes: JSON.stringify(this.nodes),
        };
    }
}
