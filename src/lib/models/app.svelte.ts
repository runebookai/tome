import moment from 'moment';

import { execute } from '$lib/apps';
import { AppMcpServer, AppRun, AppStep, McpServer, Trigger } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

const CHAT_APP_ID = 1;
const TASK_APP_ID = 2;

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
    Task = 'Task',
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
    created?: moment.Moment = $state();
    modified?: moment.Moment = $state();

    static get CHAT() {
        return App.find(CHAT_APP_ID);
    }

    static get TASK() {
        return App.find(TASK_APP_ID);
    }

    get mcpServers(): McpServer[] {
        return AppMcpServer.where({ appId: this.id }).map(m => m.mcpServer);
    }

    get steps(): AppStep[] {
        let steps = AppStep.where({ appId: this.id }).sortBy('id');
        return steps.length > 0 ? steps : [AppStep.new({ appId: this.id })];
    }

    get trigger(): Trigger | undefined {
        return Trigger.findBy({ appId: this.id });
    }

    get runs(): AppRun[] {
        return AppRun.where({ appId: this.id }).sortBy('created').reverse();
    }

    get latestRun(): AppRun {
        return this.runs[0];
    }

    // eslint-disable-next-line
    async execute(input: any = undefined): Promise<AppRun> {
        return await execute(this, input);
    }

    async addMcpServer(server: McpServer) {
        const assoc = AppMcpServer.findByOrNew({ appId: this.id, mcpServerId: server.id });
        await assoc.save();
    }

    async removeMcpServer(server: McpServer) {
        const assoc = AppMcpServer.findBy({ appId: this.id, mcpServerId: server.id });
        await assoc?.delete();
    }

    hasMcpServer(server: McpServer) {
        return AppMcpServer.exists({ appId: this.id, mcpServerId: server.id });
    }

    protected static async fromSql(row: Row): Promise<App> {
        return App.new({
            ...row,
            interface: Interface[row.interface as keyof typeof Interface],
            nodes: JSON.parse(row.nodes),
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
