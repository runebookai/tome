import { OpenAI as OpenAIClient } from 'openai';

import type { Client, Message, Options, Tool, ToolCall } from '$lib/engines/types';
import type { IMessage, IModel } from "$lib/models";

const SUPPORTED_MODELS = [
    'gpt-4o',
    'o4-mini',
    'gpt-4.5-preview',
    'gpt-4.1',
    'gpt-4.1-mini',
];

export default class OpenAI implements Client {
    client: OpenAIClient;

    constructor(apiKey: string) {
        this.client = new OpenAIClient({
            apiKey,
            dangerouslyAllowBrowser: true,
        });
    }

    async chat(model: IModel, messages: Message[], tools: Tool[] = [], options: Options = {}): Promise<IMessage> {
        const response = await this.client.chat.completions.create({
            model: model.name,
            // @ts-expect-error For some reason, the type of `messages` is marked
            // incorrect because of a difference in the `role`. Our `Role` type is
            // ripped straight from the OpenAI code, though, so :shrug:
            messages,
            tools,
            temperature: options.temperature,
        });

        const {
            role,
            content,
            tool_calls,
        } = response.choices[0].message;

        let toolCalls: ToolCall[] = [];

        if (tool_calls) {
            toolCalls = tool_calls.map(tc => ({
                function: {
                    name: tc.function.name,
                    arguments: JSON.parse(tc.function.arguments),
                }
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
        return (
            await this.client.models.list()
        )
            .data
            .filter(model => SUPPORTED_MODELS.includes(model.id))
            .map(model => {
                const { id, ...metadata } = model;
                return {
                    id: `openai:${id}`,
                    name: id,
                    metadata,
                    supportsTools: true,
                };
            });
    }

    async info(model: string): Promise<IModel> {
        const { id, ...metadata } = (
            await this.client.models.retrieve(model)
        );

        return {
            id: `openai:${id}`,
            name: id,
            metadata,
            supportsTools: true,
        };
    }

    async connected(): Promise<boolean> {
        return (
            await fetch('https://api.openai.com')
        ).status == 200;
    }
}
