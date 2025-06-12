import { CronExpressionParser } from 'cron-parser';

import { type ToSqlRow } from '$lib/models';
import Base from '$lib/models/base.svelte';


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
    period: string = $state("0 12 * * *");
    next_run: Date = $state(new Date('2099-12-31T11:59:59.999Z'));

    get default() {
        return {
            name: 'New Task',
            prompt: '',
            period: '0 12 * * *',
            next_run: new Date('2099-12-31T11:59:59.999Z'),
        };
    };
    
    async start(force: boolean = false): Promise<void> {
        if (this.should_run() || force) {
            this.next_run = await this.calculate_next_run();
            this.save();
            console.log("Starting: " + this.name + " in a webworker now...");
        }
    }
    
    should_run(): boolean {
        return this.next_run <= new Date();
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
