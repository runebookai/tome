import Ollama from '$lib/engines/ollama/client';
import Model, { type ToSqlRow } from '$lib/models/base.svelte';
import Engine from '$lib/models/engine';

// OpenAI API Key
const OPENAI_API_KEY = 'openai-api-key';

// Gemini API Key
const GEMINI_API_KEY = 'gemini-api-key';

// Ollama URL
export const OLLAMA_URL_CONFIG_KEY = 'ollama-url';

export interface ISetting {
    id?: number;
    display: string;
    key: string;
    value: unknown;
    type: string;
}

interface Row {
    id: number;
    display: string;
    key: string;
    value: string;
    type: string;
}

export default class Setting extends Model<ISetting, Row>('settings') {
    static get OllamaUrl(): string | undefined {
        return this.findBy({ key: OLLAMA_URL_CONFIG_KEY })?.value as string | undefined;
    }

    static get OpenAIKey(): string | undefined {
        return this.findBy({ key: OPENAI_API_KEY })?.value as string | undefined;
    }

    static get GeminiApiKey(): string | undefined {
        return this.findBy({ key: GEMINI_API_KEY })?.value as string | undefined;
    }

    static async validate(setting: ISetting): Promise<boolean> {
        if (setting.key == OLLAMA_URL_CONFIG_KEY) {
            const client = new Ollama(setting.value as string);
            return await client.connected();
        }
        return true;
    }

    protected static async afterUpdate(setting: ISetting): Promise<ISetting> {
        // Resync models in case a Provider key/url was updated.
        await Engine.sync();
        return setting;
    }

    protected static async fromSql(row: Row): Promise<ISetting> {
        return {
            id: row.id,
            display: row.display,
            key: row.key,
            value: row.value ? JSON.parse(row.value) : null,
            type: row.type,
        };
    }

    protected static async toSql(setting: ISetting): Promise<ToSqlRow<Row>> {
        return {
            display: setting.display,
            key: setting.key,
            value: JSON.stringify(setting.value),
            type: setting.type,
        };
    }
}
