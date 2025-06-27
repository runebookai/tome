import { CronExpressionParser } from 'cron-parser';

import { McpServer, TaskMcpServer, TaskRun } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

interface Row {
    id: number;
    name: string;
    prompt: string;
    period: string;
    next_run: string;
}

export default class Task extends Base<Row>('tasks') {
    id?: number = $state();
    name: string = $state('New Task');
    prompt: string = $state('');
    period: string = $state('0 12 * * *');
    next_run: Date = $state(new Date('2099-12-31T11:59:59.999Z'));

    get runs(): TaskRun[] {
        return TaskRun.where({ taskId: this.id }).sortBy('timestamp').reverse();
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

    should_run(): boolean {
        return this.next_run <= new Date();
    }

    async start(force: boolean = false): Promise<void> {
        if (this.should_run() || force) {
            this.next_run = await this.calculate_next_run();
            this.save();
            console.log('Starting: ' + this.name + ' in a webworker now...');
        }
    }

    async delete() {
        TaskMcpServer.where({ taskId: this.id }).forEach(r => r.delete());
        return super.delete();
    }

    protected async beforeSave(row: ToSqlRow<Row>): Promise<ToSqlRow<Row>> {
        return {
            ...row,
            next_run: (await this.calculate_next_run()).toISOString(),
        };
    }

    async calculate_next_run(): Promise<Date> {
        const interval = CronExpressionParser.parse(this.period);
        return new Date(interval.next().toString());
    }

    protected static async fromSql(row: Row): Promise<Task> {
        return Task.new({
            id: row.id,
            name: row.name,
            prompt: row.prompt,
            period: row.period,
            next_run: new Date(row.next_run),
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            name: this.name,
            prompt: this.prompt,
            period: this.period,
            next_run: this.next_run.toISOString(),
        };
    }
}
