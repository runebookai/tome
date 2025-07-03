import Base, { type ToSqlRow } from '$lib/models/base.svelte';

type AmbientEvent = 'scheduled' | 'filesystem';
type AmbientAction = 'tick' | 'file_created' | 'file_updated';
type AmbientConfig = object | undefined;

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
    config: AmbientConfig = $state({});

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
