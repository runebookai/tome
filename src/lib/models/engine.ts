import Ollama from '$lib/engines/ollama';
import OpenAI from '$lib/engines/openai'
import type { Client } from '$lib/engines/types';
import { Setting } from '$lib/models';
import { BareModel } from '$lib/models/base.svelte';
import Model, { type IModel } from '$lib/models/model';

export interface IEngine {
    id: string;
    name: string;
    client: Client;
    models: IModel[];
}

export default class Engine extends BareModel<IEngine>() {
    static fromModelId(id: string): IEngine | undefined {
        return this.find(id.split(':')[0]);
    }

    static async sync() {
        this.reset();

        if (Setting.OllamaUrl) {
            const client = new Ollama(Setting.OllamaUrl);

            this.add({
                id: 'ollama',
                name: 'Ollama',
                client,
                models: (await client.models()).sortBy('name'),
            })
        }

        if (Setting.OpenAIKey) {
            const client = new OpenAI(Setting.OpenAIKey);

            this.add({
                id: 'openai',
                name: 'OpenAI',
                client,
                models: (await client.models()).sortBy('name'),
            });
        }

        Model.reset(
            this.all().flatMap(engine => engine.models)
        );
    }
}
