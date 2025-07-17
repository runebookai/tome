import { App, AppRun, McpServer } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

interface Row {
    id: number;
    name: string;
    app_id: number;
}

export default class Task extends Base<Row>('tasks') {
    id?: number = $state();
    name: string = $state('New Task');
    appId?: number = $state();

    get app() {
        return App.find(Number(this.appId));
    }

    get runs(): AppRun[] {
        return AppRun.where({ appId: this.app?.id }).sortBy('created').reverse();
    }

    get mcpServers() {
        return this.app.mcpServers;
    }

    get latestRun() {
        return this.runs[0];
    }

    async addMcpServer(server: McpServer) {
        await this.app.addMcpServer(server);
    }

    async removeMcpServer(server: McpServer) {
        await this.app.removeMcpServer(server);
    }

    hasMcpServer(server: McpServer) {
        return this.app.hasMcpServer(server);
    }

    protected static async fromSql(row: Row): Promise<Task> {
        return Task.new({
            id: row.id,
            name: row.name,
            appId: row.app_id,
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            name: this.name,
            app_id: Number(this.appId),
        };
    }
}
