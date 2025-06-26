import moment from 'moment';

import { Session, Task } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

interface Row {
    id: number;
    task_id: number;
    session_id: number;
    success: boolean;
    timestamp: string;
}

export default class TaskRun extends Base<Row>('task_runs') {
    id?: number = $state();
    taskId?: number = $state();
    sessionId?: number = $state();
    success: boolean = $state(false);
    timestamp?: moment.Moment = $state();

    get task() {
        return Task.find(Number(this.taskId));
    }

    get session() {
        return Session.find(Number(this.sessionId));
    }

    protected static async fromSql(row: Row): Promise<TaskRun> {
        return TaskRun.new({
            id: row.id,
            taskId: row.task_id,
            sessionId: row.session_id,
            success: row.success,
            timestamp: moment.utc(row.timestamp),
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            task_id: Number(this.taskId),
            session_id: Number(this.sessionId),
            success: this.success,
            timestamp: this.timestamp?.toString() as string,
        };
    }
}
