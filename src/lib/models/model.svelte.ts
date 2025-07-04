import { Config, Engine } from '$lib/models';
import BareModel from '$lib/models/bare.svelte';

interface Metadata {
    [key: string]: any; // eslint-disable-line
}

export default class Model extends BareModel() {
    id?: string = $state();
    name: string = $state('');
    supportsTools: boolean = $state(false);
    metadata: Metadata = $state({});
    engineId?: number = $state();

    static async sync() {
        this.reset(Engine.all().flatMap(e => e.models));
    }

    static default() {
        return Model.find(Config.defaultModel) || Model.first();
    }
}
