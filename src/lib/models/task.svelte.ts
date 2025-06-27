import { CronExpressionParser } from 'cron-parser';

import { Engine, McpServer, Model, TaskMcpServer, TaskRun } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

interface Row {
    id: number;
    name: string;
    engine_id: number;
    model: string;
    prompt: string;
    period: string;
    next_run: string;
}

export default class Task extends Base<Row>('tasks') {
    id?: number = $state();
    name: string = $state('New Task');
    engineId: number = $state(Model.default().engineId);
    model: string = $state(Model.default().id);
    prompt: string = $state('');
    period: string = $state('0 12 * * *');
    nextRun: Date = $state(new Date('2099-12-31T11:59:59.999Z'));

    get runs(): TaskRun[] {
        return TaskRun.where({ taskId: this.id }).sortBy('timestamp').reverse();
    }

    get engine() {
        return Engine.find(Number(this.engineId));
    }

    get mcpServers() {
        return TaskMcpServer.where({ taskId: this.id }).map(m => m.mcpServer);
    }

    get latestRun() {
        return this.runs[0];
    }

    async addMcpServer(mcpServer: McpServer) {
        const assoc = TaskMcpServer.findByOrNew({ taskId: this.id, mcpServerId: mcpServer.id });
        await assoc.save();
    }

    async removeMcpServer(mcpServer: McpServer) {
        const assoc = TaskMcpServer.findBy({ taskId: this.id, mcpServerId: mcpServer.id });
        await assoc?.delete();
    }

    hasMcpServer(mcpServer: McpServer) {
        return TaskMcpServer.exists({ taskId: this.id, mcpServerId: mcpServer.id });
    }

    shouldRun(): boolean {
        return this.nextRun <= new Date();
    }

    async calculateNextRun(): Promise<Date> {
        const interval = CronExpressionParser.parse(this.period);
        return new Date(interval.next().toString());
    }

    async start(force: boolean = false): Promise<void> {
        if (this.shouldRun() || force) {
            this.nextRun = await this.calculateNextRun();
            this.save();
            console.log('Starting: ' + this.name + ' in a webworker now...');
        }
    }

    async delete() {
        TaskMcpServer.where({ taskId: this.id }).forEach(r => r.delete());
        return super.delete();
    }

    protected async beforeCreate(row: ToSqlRow<Row>): Promise<ToSqlRow<Row>> {
        return {
            ...row,
            next_run: (await this.calculateNextRun()).toISOString(),
        };
    }

    protected static async fromSql(row: Row): Promise<Task> {
        return Task.new({
            id: row.id,
            name: row.name,
            prompt: row.prompt,
            engineId: row.engine_id,
            model: row.model,
            period: row.period,
            nextRun: new Date(row.next_run),
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            name: this.name,
            prompt: this.prompt,
            engine_id: Number(this.engineId),
            model: String(this.model),
            period: this.period,
            next_run: this.nextRun.toISOString(),
        };
    }
}
