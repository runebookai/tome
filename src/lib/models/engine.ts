import Gemini from '$lib/engines/gemini/client';
import Ollama from '$lib/engines/ollama/client';
import OpenAI from '$lib/engines/openai/client';
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
            let models: IModel[] = [];

            try {
                models = (await client.models()).sortBy<IModel>('name');
            } catch {
                // noop
            }

            this.add({
                id: 'ollama',
                name: 'Ollama',
                client,
                models,
            });
        }

        if (Setting.OpenAIKey) {
            const client = new OpenAI({ apiKey: Setting.OpenAIKey });
            let models: IModel[] = [];

            try {
                models = (await client.models()).sortBy('name');
            } catch {
                // noop
            }

            this.add({
                id: 'openai',
                name: 'OpenAI',
                client,
                models,
            });
        }

        if (Setting.GeminiApiKey) {
            const client = new Gemini({ apiKey: Setting.GeminiApiKey });
            let models: IModel[] = [];

            try {
                models = (await client.models()).sortBy('name');
            } catch {
                // noop
            }

            this.add({
                id: 'gemini',
                name: 'Gemini',
                client,
                models,
            });
        }

        Model.reset(this.all().flatMap(engine => engine.models));
    }
}
