import { invoke } from '@tauri-apps/api/core';

import Model, { type ToSqlRow } from '$lib/models/base.svelte';

export interface ITask{
    id?: number;
    name: string;
    prompt: string;
    // This is stored as a cron expression
    period: string;
    next_run: Date;
}

interface Row {
    id: number;
    name: string;
    prompt: string;
    period: string;
    next_run: string;
}

export default class Task extends Model<ITask, Row>('tasks') {
    static defaults = {
        name: 'New Task',
        prompt: '',
    };

    static async start(task: ITask) {
        console.log("Starting: " + task.name + " in a webworker now...")
    }

    static async calculate_next_run_time(task: ITask) {

    }

    // static async afterCreate(server: ITask): Promise<ITask> {
    //     const metadata: Metadata = JSON.parse(
    //         await invoke('get_metadata', {
    //             command: server.command,
    //             args: server.args,
    //             env: server.env,
    //         })
    //     );

    //     const name = metadata.serverInfo?.name
    //         ?.replace('mcp-server/', '')
    //         ?.replace('/', '-') as string;

    //     return await this.update({
    //         ...server,
    //         name,
    //         metadata,
    //     });
    // }

    static async fromSql(row: Row): Promise<ITask> {
        return {
            id: row.id,
            name: row.name,
            prompt: row.prompt,
            period: row.period,
            next_run: new Date(row.next_run),
        };
    }

    static async toSql(task: ITask): Promise<ToSqlRow<Row>> {
        return {
            name: task.name,
            prompt: task.prompt,
            period: task.period,
            next_run: task.next_run.toISOString(),
        };
    }
}
