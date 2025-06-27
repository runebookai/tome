import moment from 'moment';

import { Session, Task } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

export enum State {
    Pending = 'Pending',
    Success = 'Success',
    Failure = 'Failure',
}

interface Row {
    id: number;
    task_id: number;
    session_id: number;
    state: State;
    state_reason: string | undefined;
    created: string;
}

export default class TaskRun extends Base<Row>('task_runs') {
    id?: number = $state();
    taskId?: number = $state();
    sessionId?: number = $state();
    state: State = $state(State.Pending);
    stateReason: undefined | string = $state();
    created?: moment.Moment = $state();

    static stale() {
        return TaskRun.where({ state: State.Pending }).filter(run =>
            run.created?.isBefore(moment().subtract(24, 'hours'))
        );
    }

    get task() {
        return Task.find(Number(this.taskId));
    }

    get session() {
        return Session.find(Number(this.sessionId));
    }

    async pending() {
        this.state = State.Pending;
        await this.save();
    }

    async succeed() {
        this.state = State.Success;
        await this.save();
    }

    async fail() {
        this.state = State.Failure;
        await this.save();
    }

    protected static async fromSql(row: Row): Promise<TaskRun> {
        return TaskRun.new({
            id: row.id,
            taskId: row.task_id,
            sessionId: row.session_id,
            state: row.state,
            stateReason: row.state_reason,
            created: moment.utc(row.created),
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            task_id: Number(this.taskId),
            session_id: Number(this.sessionId),
            state: this.state,
            state_reason: this.stateReason,
        };
    }
}
