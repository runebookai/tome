import * as color from '$lib/colorscheme';
import { Engine } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

// Custom System Prompt
export const CUSTOM_SYSTEM_PROMPT = 'custom-system-prompt';

export type SettingKey =
    | 'openai-api-key'
    | 'gemini-api-key'
    | 'ollama-url'
    | 'custom-system-prompt'
    | 'color-scheme';

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

    @getset('openai-api-key')
    static OpenAIKey: string;

    @getset('gemini-api-key')
    static GeminiApiKey: string;

    @getset('ollama-url')
    static OllamaUrl: string;

    @getset('custom-system-prompt')
    static CustomSystemPrompt: string;

    @getset('color-scheme')
    static ColorScheme: color.ColorScheme;

    protected static async afterUpdate() {
        // Resync models in case a Provider key/url was updated.
        await Engine.sync();
    }

    protected async afterSave() {
        color.apply(Setting.ColorScheme);
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

function getset(key: SettingKey) {
    return function (target: object, property: string) {
        function get() {
            return Setting.findBy({ key })?.value;
        }

        async function set(value: unknown) {
            const setting = Setting.findBy({ key }) || Setting.new({ key });
            setting.value = value;
            await setting.save();
        }

        Object.defineProperty(target, property, {
            get,
            set,
        });
    };
}
