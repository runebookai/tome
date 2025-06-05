import { type GenerateContentConfig, GoogleGenAI } from '@google/genai';

import GeminiMessage from '$lib/engines/gemini/message';
import GeminiTools from '$lib/engines/gemini/tool';
import type { Client, ClientProps, Options, Tool, ToolCall } from '$lib/engines/types';
import { type IModel, Message } from '$lib/models';

export default class Gemini implements Client {
    private options: ClientProps;
    private client: GoogleGenAI;

    id = 'gemini';

    constructor(options: ClientProps) {
        this.options = options;
        this.client = new GoogleGenAI({
            apiKey: options.apiKey,
        });
    }

    async chat(
        model: IModel,
        history: Message[],
        tools?: Tool[],
        options?: Options
    ): Promise<Message> {
        const messages = history.map(m => GeminiMessage.from(m)).compact();

        let config: GenerateContentConfig = {
            temperature: options?.temperature,
        };

        if (tools && tools.length) {
            config = {
                tools: GeminiTools.from(tools),
            };
        }

        const { text, functionCalls } = await this.client.models.generateContent({
            model: model.name,
            contents: messages,
            config,
        });

        let toolCalls: ToolCall[] = [];

        if (functionCalls) {
            toolCalls = functionCalls.map(tc => ({
                function: {
                    name: tc.name as string,
                    arguments: tc.args || {},
                },
            }));
        }

        return Message.new({
            model: model.name,
            name: '',
            role: 'assistant',
            content: text || '',
            toolCalls,
        });
    }

    async models(): Promise<IModel[]> {
        return (await this.client.models.list()).page.map(model => {
            const metadata = model;
            const name = metadata.name?.replace('models/', '') as string;

            return {
                id: `gemini:${name}`,
                name,
                metadata,
                engineId: this.options.engineId,
                supportsTools: true,
            };
        });
    }

    async info(model: string): Promise<IModel> {
        const { name, displayName, ...metadata } = await this.client.models.get({ model });

        return {
            id: `gemini:${name}`,
            name: displayName as string,
            metadata,
            engineId: this.options.engineId,
            supportsTools: true,
        };
    }

    async connected(): Promise<boolean> {
        try {
            await this.client.models.list();
            return true;
        } catch {
            return false;
        }
    }
}
