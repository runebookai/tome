import { BareModel } from "$lib/models/base.svelte";
import Engine from "$lib/models/engine";

export interface IModel {
    id: string;
    name: string;
    supportsTools: boolean;
    metadata: {
        [key: string]: any; // eslint-disable-line
    }
}

export default class Model extends BareModel<IModel>() {
    static default(): IModel {
        return Engine.first().models[0];
    }

    static findOrDefault(id: string): IModel {
        return this.find(id) || this.default();
    }
}
