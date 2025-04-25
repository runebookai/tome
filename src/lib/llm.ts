import type { IMessage } from "./models/message";

import { HttpClient } from "$lib/http";
import type { Message, Model, Response, Tags, Tool } from "$lib/llm.d";
import Setting from "$lib/models/setting";

export * from '$lib/llm.d';

export class Client extends HttpClient {
    options: RequestInit = {
        signal: AbortSignal.timeout(30000),
        headers: {
            'Content-Type': 'application/json',
        }
    };

    get url() {
        return Setting.OllamaUrl;
    }

    async chat(model: string, messages: Message[], tools: Tool[] = []): Promise<IMessage> {
        const body = JSON.stringify({
            model,
            messages,
            tools,
            stream: false,
        });

        const response = await this.post('/api/chat', { body }) as Response;

        let thought: string | undefined;
        let content: string = response
            .message
            .content
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

    async list(): Promise<Model[]> {
        return (
            await this.get('/api/tags') as Tags
        ).models as Model[];
    }

    async info(name: string): Promise<Model> {
        const body = JSON.stringify({ name });

        return (
            await this.post('/api/show', { body })
        ) as Model;
    }

    async connected(): Promise<boolean> {
        return (
            await this.get('', { raw: true }) as globalThis.Response
        ).status == 200;
    }

    async hasModels(): Promise<boolean> {
        return (
            await this.get('/api/tags', { raise: false }) as Tags
        )?.models.length > 0;
    }
}
