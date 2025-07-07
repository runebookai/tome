import { App, Engine, Model } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

interface Row {
    id: number;
    app_id: number;
    engine_id: number;
    model: string;
    prompt: string;
}

export default class AppStep extends Base<Row>('app_steps') {
    id?: number = $state();
    appId?: number = $state();
    engineId: number = $state(Number(Model.default().engineId));
    model: string = $state(String(Model.default().id));
    prompt: string = $state('');

    get app() {
        return App.find(Number(this.appId));
    }

    get engine(): Engine {
        return Engine.find(Number(this.engineId));
    }

    protected static async fromSql(row: Row): Promise<AppStep> {
        return AppStep.new({
            id: row.id,
            appId: row.app_id,
            engineId: row.engine_id,
            model: row.model,
            prompt: row.prompt,
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            app_id: Number(this.appId),
            engine_id: this.engineId,
            model: this.model,
            prompt: this.prompt,
        };
    }
}
