import moment from 'moment';

import { execute } from '$lib/apps';
import { AppMcpServer, AppRun, AppStep, McpServer, Trigger } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

const CHAT_APP_ID = 1;
const TASK_APP_ID = 2;
const RELAY_APP_ID = 3;

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
    name: string = $state('');
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

    static get RELAY() {
        return App.find(RELAY_APP_ID);
    }

    // TODO: make `all()` return this by default and make it so you need
    // explicitly get the reserved apps.
    static nonReserved() {
        return this.all().filter(
            a => ![CHAT_APP_ID, TASK_APP_ID, RELAY_APP_ID].includes(a.id as number)
        );
    }

    get mcpServers(): McpServer[] {
        return AppMcpServer.where({ appId: this.id }).map(m => m.mcpServer);
    }

    get steps(): AppStep[] {
        const steps = AppStep.where({ appId: this.id }).sortBy('id');
        return steps.length > 0 ? steps : [AppStep.new({ appId: this.id })];
    }

    get trigger(): Trigger {
        return Trigger.findBy({ appId: this.id }) || Trigger.new({ appId: this.id });
    }

    get runs(): AppRun[] {
        return AppRun.where({ appId: this.id }).sortBy('created').reverse();
    }

    get latestRun(): AppRun {
        return this.runs[0];
    }

    async execute(input?: object): Promise<AppRun> {
        return await execute(this, input);
    }

    async addStep(step: AppStep) {
        step.appId = this.id;
        await step.save();
    }

    hasMcpServer(server: McpServer) {
        return AppMcpServer.exists({ appId: this.id, mcpServerId: server.id });
    }

    async addMcpServer(server: McpServer) {
        await AppMcpServer.findByOrNew({ appId: this.id, mcpServerId: server.id }).save();
    }

    async removeMcpServer(server: McpServer) {
        await AppMcpServer.findBy({ appId: this.id, mcpServerId: server.id })?.delete();
    }

    async setMcpServers(servers: McpServer[]) {
        await this.clearMcpServers();
        await servers.awaitAll(async server => await this.addMcpServer(server));
    }

    async clearMcpServers() {
        await AppMcpServer.where({ appId: this.id }).awaitAll(async s => await s.delete());
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
