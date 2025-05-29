import { Ollama as OllamaClient } from 'ollama/browser';

import OllamaMessage from '$lib/engines/ollama/message';
import type { Client, ClientOptions, Options, Role, Tool } from '$lib/engines/types';
import { fetch } from '$lib/http';
import Message, { type IMessage } from '$lib/models/message';
import type { IModel } from '$lib/models/model';

export default class Ollama implements Client {
    private options: ClientOptions;
    private client: OllamaClient;

    message = OllamaMessage;
    modelRole = 'assistant' as Role;
    toolRole = 'tool' as Role;

    constructor(options: ClientOptions) {
        this.options = options;
        this.client = new OllamaClient({
            host: options.url,
            fetch,
        });
    }

    async chat(
        model: IModel,
        history: IMessage[],
        tools: Tool[] = [],
        options: Options = {}
    ): Promise<IMessage> {
        const messages = history.map(m => this.message.from(m));
        const response = await this.client.chat({
            model: model.name,
            messages,
            tools,
            options,
            stream: false,
        });

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

        return Message.default({
            model: model.name,
            role: this.modelRole,
            content,
            thought,
            toolCalls: response.message.tool_calls || [],
        });
    }

    async models(): Promise<IModel[]> {
        return await Promise.all(
            (await this.client.list()).models.map(async model => await this.info(model.name))
        );
    }

    async info(name: string): Promise<IModel> {
        const metadata = await this.client.show({ model: name });

        // @ts-expect-error The Ollama SDK doesn't define the `capabilities`
        // property, but the API returns it.
        const capabilities = metadata.capabilities as string[];

        return {
            id: name,
            name,
            metadata,
            engineId: this.options.engine.id,
            supportsTools: capabilities.includes('tools'),
        };
    }

    async connected(): Promise<boolean> {
        return (await fetch(new URL(this.options.url).origin, { timeout: 200 })).status == 200;
    }
}
