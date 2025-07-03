import { CronExpressionParser } from 'cron-parser';
import moment from 'moment';

import { Engine, McpServer, Model, TaskMcpServer, TaskRun } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';
import { execute } from '$lib/tasks';

interface Row {
    id: number;
    name: string;
    engine_id: number;
    app_id: number;
    model: string;
    prompt: string;
    period: string;
    next_run: string;
}

export default class Task extends Base<Row>('tasks') {
    id?: number = $state();
    name: string = $state('New Task');
    engineId: number = $state(Model.default().engineId as number);
    appId?: number = $state();
    model: string = $state(Model.default().id as string);
    prompt: string = $state('');
    period: string = $state('0 12 * * *');
    nextRun: moment.Moment = $state(moment());

    static needsToRun() {
        return Task.all().filter(t => t.shouldRun());
    }

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
        return this.nextRun.isBefore(moment());
    }

    async calculateNextRun(): Promise<moment.Moment> {
        const interval = CronExpressionParser.parse(this.period);
        return moment.utc(interval.next().toISOString());
    }

    async setNextRun() {
        this.nextRun = await this.calculateNextRun();
        await this.save();
    }

    async start(): Promise<TaskRun | undefined> {
        this.nextRun = await this.calculateNextRun();
        await this.save();
        return await execute(this);
    }

    async delete() {
        TaskMcpServer.where({ taskId: this.id }).forEach(r => r.delete());
        TaskRun.where({ taskId: this.id }).forEach(r => r.delete());
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
            appId: row.app_id,
            model: row.model,
            period: row.period,
            nextRun: moment.utc(row.next_run),
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            name: this.name,
            prompt: this.prompt,
            engine_id: Number(this.engineId),
            app_id: Number(this.appId),
            model: String(this.model),
            period: this.period,
            next_run: this.nextRun.toISOString(),
        };
    }
}
