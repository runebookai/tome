import { BareModel } from '$lib/models/base.svelte';
import Config from '$lib/models/config';
import Engine from '$lib/models/engine';

export interface IModel {
    id: string;
    name: string;
    supportsTools: boolean;
    metadata: {
        [key: string]: any; // eslint-disable-line
    };
    engineId: number;
}

export default class Model extends BareModel<IModel>() {
    static async sync() {
        this.reset(Engine.all().flatMap(e => e.models));
    }

    static default(): IModel {
        return this.find(Config.defaultModel) || Engine.first().models[0];
    }

    static findByOrDefault(params: Partial<IModel>): IModel {
        return this.findBy(params) || this.default();
    }
}
