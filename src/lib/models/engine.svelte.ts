import type { ToSqlRow } from './base.svelte';

import Gemini from '$lib/engines/gemini/client';
import Ollama from '$lib/engines/ollama/client';
import OpenAI from '$lib/engines/openai/client';
import type { Client, ClientOptions } from '$lib/engines/types';
import { error } from '$lib/logger';
import { type IModel, Model } from '$lib/models';
import Base from '$lib/models/base.svelte';

const AVAILABLE_MODELS: Record<EngineType, 'all' | string[]> = {
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

type EngineType = 'ollama' | 'openai' | 'gemini' | 'openai-compat';

interface Row {
    id: number;
    name: string;
    type: string;
    options: string;
}

export default class Engine extends Base<Row>('engines') {
    id?: number = $state();
    name: string = $state('');
    type: EngineType = $state('openai-compat');
    options: ClientOptions = $state({ url: '', apiKey: '' });
    models: IModel[] = $state([]);

    static async sync() {
        await super.sync();
        await Model.sync();
    }

    static fromModelId(id: string): Engine | undefined {
        return this.findBy({ type: id.split(':')[0] as EngineType });
    }

    get client(): Client | undefined {
        const Client = {
            ollama: Ollama,
            openai: OpenAI,
            gemini: Gemini,
            'openai-compat': OpenAI,
        }[this.type];

        if (Client) {
            try {
                return new Client({ ...this.options, engineId: Number(this.id) });
            } catch {
                return undefined;
            }
        }
    }

    protected async afterUpdate() {
        await Model.sync();
    }

    protected static async fromSql(row: Row): Promise<Engine> {
        const engine = Engine.new({
            id: row.id,
            name: row.name,
            type: row.type as EngineType,
            options: JSON.parse(row.options),
            models: [],
        });

        if (engine.client) {
            try {
                engine.models = (await engine.client.models())
                    .filter(
                        m =>
                            AVAILABLE_MODELS[engine.type] == 'all' ||
                            AVAILABLE_MODELS[engine.type].includes(m.name)
                    )
                    .map(m => ({
                        ...m,
                        id: m.name,
                        engineId: Number(engine.id),
                    }))
                    .sortBy('name');
            } catch {
                // noop
            }
        }

        return engine;
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            name: this.name,
            type: this.type,
            options: JSON.stringify(this.options),
        };
    }
}
