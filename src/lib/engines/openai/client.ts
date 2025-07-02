import { OpenAI as OpenAIClient } from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/index.mjs';

import OpenAiMessage from '$lib/engines/openai/message';
import type { Client, ClientProps, Options, Tool, ToolCall } from '$lib/engines/types';
import { fetch } from '$lib/http';
import { Message, Model } from '$lib/models';

export default class OpenAI implements Client {
    private options: ClientProps;
    private client: OpenAIClient;

    id = 'openai';

    constructor(options: ClientProps) {
        this.options = options;
        this.client = new OpenAIClient({
            apiKey: options.apiKey,
            baseURL: options.url,
            fetch,
            dangerouslyAllowBrowser: true,
        });
    }

    async chat(
        model: Model,
        history: Message[],
        tools: Tool[] = [],
        _options: Options = {}
    ): Promise<Message> {
        const messages = history.map(m => OpenAiMessage.from(m));
        const completion: ChatCompletionCreateParamsNonStreaming = {
            model: model.name,
            messages,
        };

        if (tools.length > 0) {
            completion.tools = tools;
        }

        const response = await this.client.chat.completions.create(completion);
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

        return Message.new({
            model: model.name,
            name: '',
            role,
            content: content || '',
            toolCalls,
        });
    }

    async models(): Promise<Model[]> {
        return (await this.client.models.list({ timeout: 1000 })).data.map(model => {
            const { id, ...metadata } = model;
            const name = id.replace('models/', ''); // Gemini model ids are prefixed with "model/"

            return Model.new({
                id: `${this.id}:${name}`,
                name,
                metadata,
                engineId: this.options.engineId,
                supportsTools: true,
            });
        });
    }

    async info(model: string): Promise<Model> {
        const { id, ...metadata } = await this.client.models.retrieve(model);

        return Model.new({
            id,
            name: id,
            metadata,
            engineId: this.options.engineId,
            supportsTools: true,
        });
    }

    async connected(): Promise<boolean> {
        try {
            const resp = await this.client.models.list().asResponse();
            const body = await resp.json();
            return !Object.hasOwn(body, 'error');
        } catch {
            return false;
        }
    }
}
