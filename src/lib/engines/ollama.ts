import { Ollama as OllamaClient } from 'ollama/browser';

import type { Client, Message, Options, Tool } from '$lib/engines/types';
import type { IModel } from '$lib/models';
import type { IMessage } from "$lib/models/message";
import Setting from "$lib/models/setting";

export default class Ollama implements Client {
    client: OllamaClient;

    constructor(host: string) {
        this.client = new OllamaClient({ host });
    }

    async chat(model: IModel, messages: Message[], tools: Tool[] = [], options: Options = {}): Promise<IMessage> {
        const response = await this.client.chat({
            model: model.name,
            messages,
            tools,
            options,
            stream: false,
        });

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
            model: model.name,
            role: 'assistant',
            content,
            thought,
            name: '',
            toolCalls: response.message.tool_calls || [],
        };
    }

    async models(): Promise<IModel[]> {
        const models = (
            await this.client.list()
        ).models;

        return Promise.all(
            models.map(async (model) => (
                await this.info(model.name)
            ))
        );
    }

    async info(name: string): Promise<IModel> {
        const metadata = await this.client.show({ model: name });

        // @ts-expect-error The Ollama SDK doesn't define the `capabilities`
        // property, but the API returns it.
        const capabilities = metadata.capabilities as string[];

        return {
            id: `ollama:${name}`,
            name,
            metadata,
            supportsTools: capabilities.includes('tools'),
        };
    }

    async connected(): Promise<boolean> {
        if (!Setting.OllamaUrl) {
            return false;
        }

        return (
            await fetch(Setting.OllamaUrl)
        ).status == 200;
    }
}
