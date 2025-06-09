import { Config, Engine } from '$lib/models';
import { BareModel } from '$lib/models';

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
        return this.find(Config.defaultModel) || this.first();
    }

    static findByOrDefault(params: Partial<IModel>): IModel {
        return this.findBy(params) || this.default();
    }
}
