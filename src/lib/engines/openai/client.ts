import { OpenAI as OpenAIClient } from 'openai';

import OpenAiMessage from '$lib/engines/openai/message';
import type { Client, ClientOptions, Options, Tool, ToolCall } from '$lib/engines/types';
import { fetch } from '$lib/http';
import type { IMessage } from '$lib/models/message';
import type { IModel } from '$lib/models/model';

export default class OpenAI implements Client {
    private client: OpenAIClient;

    id = 'openai';

    constructor(options: ClientOptions) {
        this.client = new OpenAIClient({
            apiKey: options.apiKey,
            baseURL: options.url,
            fetch,
            dangerouslyAllowBrowser: true,
        });
    }

    async chat(
        model: IModel,
        history: IMessage[],
        tools: Tool[] = [],
        options: Options = {}
    ): Promise<IMessage> {
        const messages = history.map(m => OpenAiMessage.from(m));
        const response = await this.client.chat.completions.create({
            model: model.name,
            messages,
            tools,
        });

        const { role, content, tool_calls } = response.choices[0].message;

        let toolCalls: ToolCall[] = [];

        if (tool_calls) {
            toolCalls = tool_calls.map(tc => ({
                function: {
                    name: tc.function.name,
                    arguments: JSON.parse(tc.function.arguments),
                },
            }));
        }

        return {
            model: model.name,
            name: '',
            role,
            content: content || '',
            toolCalls,
        };
    }

    async models(): Promise<IModel[]> {
        return (await this.client.models.list()).data.map(model => {
            const { id, ...metadata } = model;
            const name = id.replace('models/', ''); // Gemini model ids are prefixed with "model/"

            return {
                id: `${this.id}:${name}`,
                name,
                metadata,
                supportsTools: true,
            };
        });
    }

    async info(model: string): Promise<IModel> {
        const { id, ...metadata } = await this.client.models.retrieve(model);

        return {
            id: `openai:${id}`,
            name: id,
            metadata,
            supportsTools: true,
        };
    }

    async connected(): Promise<boolean> {
        return (await fetch('https://api.openai.com')).status == 200;
    }
}
