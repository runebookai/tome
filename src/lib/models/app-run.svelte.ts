import moment from 'moment';

import { App, Session } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

export enum State {
    Pending = 'Pending',
    Success = 'Success',
    Failure = 'Failure',
}

interface Row {
    id: number;
    app_id: number;
    session_id: number;
    state: State;
    state_reason: string | undefined;
    created: string;
}

export default class AppRun extends Base<Row>('app_runs') {
    id?: number = $state();
    appId?: number = $state();
    sessionId?: number = $state();
    state: State = $state(State.Pending);
    stateReason: undefined | string = $state();
    created?: moment.Moment = $state();

    static stale() {
        return AppRun.where({ state: State.Pending }).filter(run =>
            run.created?.isBefore(moment().subtract(24, 'hours'))
        );
    }

    get app() {
        return App.find(Number(this.appId));
    }

    get session() {
        return Session.find(Number(this.sessionId));
    }

    isPending() {
        return this.state == State.Pending;
    }

    async pending() {
        this.state = State.Pending;
        await this.save();
    }

    isSuccess() {
        return this.state == State.Success;
    }

    async succeed() {
        this.state = State.Success;
        await this.save();
    }

    isFailure() {
        return this.state == State.Failure;
    }

    async fail(reason: string = '') {
        await (this as AppRun).update({
            state: State.Failure,
            stateReason: reason,
        });
    }

    protected static async fromSql(row: Row): Promise<AppRun> {
        return AppRun.new({
            id: row.id,
            appId: row.app_id,
            sessionId: row.session_id,
            state: row.state,
            stateReason: row.state_reason,
            created: moment.utc(row.created),
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            app_id: Number(this.appId),
            session_id: Number(this.sessionId),
            state: this.state,
            state_reason: this.stateReason,
        };
    }
}
