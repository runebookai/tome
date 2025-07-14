import CronExpressionParser from 'cron-parser';
import moment from 'moment';

import App from './app.svelte';

import Base, { type ToSqlRow } from '$lib/models/base.svelte';

type AmbientEvent = 'scheduled' | 'filesystem';
type AmbientAction = 'tick' | 'created' | 'updated';

export interface ScheduledConfig {
    period: string;
}

export interface FilesystemConfig {
    path: string;
}

interface Row {
    id: number;
    app_id: number;
    event: AmbientEvent;
    action: AmbientAction;
    config: string;
}

export default class Trigger extends Base<Row>('triggers') {
    id?: number = $state();
    appId?: number = $state();
    event: AmbientEvent = $state('scheduled');
    action: AmbientAction = $state('tick');
    config: object = $state({});

    static get scheduled() {
        return Trigger.where({
            event: 'scheduled',
            action: 'tick',
        });
    }

    static newScheduled(): Trigger {
        return this.new({
            config: {
                period: '0 * * * *',
            },
        });
    }

    get app() {
        return App.find(Number(this.appId));
    }

    isScheduled(): boolean {
        return this.event == 'scheduled' && this.action == 'tick';
    }

    shouldExecute(): boolean {
        if (!this.isScheduled()) {
            return false;
        }

        const config = this.config as ScheduledConfig;
        const runAt = moment.utc(CronExpressionParser.parse(config.period).prev().toISOString());
        const now = moment.utc().startOf('hour');

        return now.isSame(runAt);
    }

    protected static async fromSql(row: Row): Promise<Trigger> {
        return Trigger.new({
            id: row.id,
            appId: row.app_id,
            event: row.event,
            action: row.action,
            config: JSON.parse(row.config),
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            app_id: Number(this.appId),
            event: this.event,
            action: this.action,
            config: JSON.stringify(this.config),
        };
    }
}
