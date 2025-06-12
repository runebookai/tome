import { Engine } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

// OpenAI API Key
const OPENAI_API_KEY = 'openai-api-key';

// Gemini API Key
const GEMINI_API_KEY = 'gemini-api-key';

// Ollama URL
export const OLLAMA_URL_CONFIG_KEY = 'ollama-url';

// Custom System Prompt
export const CUSTOM_SYSTEM_PROMPT = 'custom-system-prompt';
const COLOR_SCHEME_KEY = 'color-scheme';

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

export default class Setting extends Base<Row>('settings') {
    id?: number = $state();
    display: string = $state('');
    key: string = $state('');
    value: unknown = $state('');
    type: string = $state('');

    static get OllamaUrl(): string | undefined {
        return this.findBy({ key: OLLAMA_URL_CONFIG_KEY })?.value as string | undefined;
    }

    static get OpenAIKey(): string | undefined {
        return this.findBy({ key: OPENAI_API_KEY })?.value as string | undefined;
    }

    static get GeminiApiKey(): string | undefined {
        return this.findBy({ key: GEMINI_API_KEY })?.value as string | undefined;
    }

    static get CustomSystemPrompt(): string | undefined {
        return this.findBy({ key: CUSTOM_SYSTEM_PROMPT })?.value as string | undefined;
    static get ColorScheme(): string | undefined {
        return this.findBy({ key: COLOR_SCHEME_KEY })?.value as string | undefined;
    }

    static set ColorScheme(value: string | undefined) {
        const setting = this.findBy({ key: COLOR_SCHEME_KEY });
        if (setting && value) {
            setting.value = value;
            setting.save();
        }
    }

    protected static async afterUpdate() {
        // Resync models in case a Provider key/url was updated.
        await Engine.sync();
    }

    protected static async fromSql(row: Row): Promise<Setting> {
        return Setting.new({
            id: row.id,
            display: row.display,
            key: row.key,
            value: row.value ? JSON.parse(row.value) : null,
            type: row.type,
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            display: this.display,
            key: this.key,
            value: JSON.stringify(this.value),
            type: this.type,
        };
    }
}
