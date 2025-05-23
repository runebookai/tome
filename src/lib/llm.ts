import type { IMessage } from './models/message';

import { HttpClient, type HttpOptions } from '$lib/http';
import type {
    LlmMessage,
    LlmOptions,
    LlmTool,
    OllamaModel,
    OllamaResponse,
    OllamaTags,
} from '$lib/llm.d';
import Setting from '$lib/models/setting';

export * from '$lib/llm.d';

export class OllamaClient extends HttpClient {
    options: HttpOptions = {
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    get url() {
        return Setting.OllamaUrl;
    }

    async chat(
        model: string,
        messages: LlmMessage[],
        tools: LlmTool[] = [],
        options: LlmOptions = {}
    ): Promise<IMessage> {
        const body = JSON.stringify({
            model,
            messages,
            tools,
            options,
            stream: false,
        });

        const response = (await this.post('/api/chat', {
            body,
        })) as OllamaResponse;

        let thought: string | undefined;
        let content: string = response.message.content
            .replace(/\.$/, '')
            .replace(/^"/, '')
            .replace(/"$/, '');

        if (content.includes('<think>')) {
            [thought, content] = content.split('</think>');
            thought = thought.replace('<think>', '').trim();
            content = content.trim();
        }

        return {
            model,
            role: 'assistant',
            content,
            thought,
            name: '',
            toolCalls: response.message.tool_calls || [],
        };
    }

    async list(): Promise<OllamaModel[]> {
        return ((await this.get('/api/tags')) as OllamaTags).models as OllamaModel[];
    }

    async info(name: string): Promise<OllamaModel> {
        const body = JSON.stringify({ name });

        return (await this.post('/api/show', { body })) as OllamaModel;
    }

    async connected(): Promise<boolean> {
        return (
            (
                (await this.get('', {
                    raw: true,
                    timeout: 500,
                })) as globalThis.Response
            ).status == 200
        );
    }

    async hasModels(): Promise<boolean> {
        if (!(await this.connected())) {
            return false;
        }

        return ((await this.get('/api/tags')) as OllamaTags).models.length > 0;
    }
}
