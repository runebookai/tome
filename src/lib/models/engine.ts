import type { IModel } from './model';

import Gemini from '$lib/engines/gemini/client';
import Ollama from '$lib/engines/ollama/client';
import OpenAI from '$lib/engines/openai/client';
import type { Client, ClientOptions } from '$lib/engines/types';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

const AVAILABLE_MODELS: Record<IEngine['type'], 'all' | string[]> = {
    'openai-compat': 'all',
    ollama: 'all',
    openai: ['gpt-4o', 'o4-mini', 'gpt-4.5-preview', 'gpt-4.1', 'gpt-4.1-mini'],
    gemini: [
        'gemini-2.5-pro-exp-03-25',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-2.5-flash-preview-05-20',
        'gemini-2.5-pro-preview-05-06',
        'gemini-1.5-pro',
    ],
};

export interface IEngine {
    id: number;
    name: string;
    type: 'ollama' | 'openai' | 'gemini' | 'openai-compat';
    options: ClientOptions;
    models: IModel[];
    client?: Client;
}

interface Row {
    id: number;
    name: string;
    type: string;
    options: string;
}

export default class Engine extends Base<IEngine, Row>('engines') {
    static defaults = {
        name: '',
        type: 'openai-compat',
        options: {
            url: '',
            apiKey: '',
        },
    };

    static fromModelId(id: string): IEngine | undefined {
        return this.findBy({ type: id.split(':')[0] as IEngine['type'] });
    }

    protected static async fromSql(row: Row): Promise<IEngine> {
        const engine: IEngine = {
            id: row.id,
            name: row.name,
            type: row.type as IEngine['type'],
            options: JSON.parse(row.options),
            models: [],
        };

        const Client = {
            ollama: Ollama,
            openai: OpenAI,
            gemini: Gemini,
            'openai-compat': OpenAI,
        }[engine.type];

        let client: Client | undefined;
        let models: IModel[] = [];

        try {
            client = new Client(engine.options);
            models = (await client.models())
                .filter(
                    m =>
                        AVAILABLE_MODELS[engine.type] == 'all' ||
                        AVAILABLE_MODELS[engine.type].includes(m.name)
                )
                .map(m => ({
                    ...m,
                    id: m.name,
                    engineId: engine.id,
                }))
                .sortBy('name');
        } catch {
            // noop
        }

        return {
            ...engine,
            client,
            models,
        };
    }

    protected static async toSql(engine: ToSqlRow<IEngine>): Promise<ToSqlRow<Row>> {
        return {
            name: engine.name,
            type: engine.type,
            options: JSON.stringify(engine.options),
        };
    }
}
