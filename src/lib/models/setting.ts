import { OllamaClient } from '$lib/llm';
import Model, { type ToSqlRow } from '$lib/models/base.svelte';
import LLMModel from '$lib/models/model.svelte';

// Ollama URL
export const OLLAMA_URL_CONFIG_KEY = 'ollama-url';

export interface ISetting {
    id?: number;
    display: string;
    key: string;
    value: unknown;
}

interface Row {
    id: number;
    display: string;
    key: string;
    value: string;
}

export default class Setting extends Model<ISetting, Row>('settings') {
    static get OllamaUrl(): string {
        return this.findBy({ key: OLLAMA_URL_CONFIG_KEY }).value as string;
    }

    static async validate(setting: ISetting): Promise<boolean> {
        if (setting.key == OLLAMA_URL_CONFIG_KEY) {
            const client = new OllamaClient({ url: setting.value as string })
            return await client.connected();
        }
        return true;
    }

    protected static async afterUpdate(setting: ISetting): Promise<ISetting> {
        if (setting.key == OLLAMA_URL_CONFIG_KEY) {
            await LLMModel.sync();
        }

        return setting;
    }

    protected static async fromSql(row: Row): Promise<ISetting> {
        return {
            id: row.id,
            display: row.display,
            key: row.key,
            value: JSON.parse(row.value),
        }
    }

    protected static async toSql(setting: ISetting): Promise<ToSqlRow<Row>> {
        return {
            display: setting.display,
            key: setting.key,
            value: JSON.stringify(setting.value),
        }
    }
}
