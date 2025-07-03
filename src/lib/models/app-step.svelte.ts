import Base, { type ToSqlRow } from '$lib/models/base.svelte';

interface Row {
    id: number;
    app_id: number;
    prompt: string;
}

export default class AppStep extends Base<Row>('app_steps') {
    id?: number = $state();
    appId?: number = $state();
    prompt: string = $state('');

    protected static async fromSql(row: Row): Promise<AppStep> {
        return AppStep.new({
            id: row.id,
            appId: row.app_id,
            prompt: row.prompt,
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            app_id: Number(this.appId),
            prompt: this.prompt,
        };
    }
}
