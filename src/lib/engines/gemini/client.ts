import { type GenerateContentConfig, GoogleGenAI } from '@google/genai';

import GeminiMessage from '$lib/engines/gemini/message';
import GeminiTools from '$lib/engines/gemini/tool';
import type { Client, ClientOptions, Options, Tool, ToolCall } from '$lib/engines/types';
import type { IMessage, IModel } from '$lib/models';

export default class Gemini implements Client {
    private options: ClientOptions;
    private client: GoogleGenAI;

    id = 'gemini';

    constructor(options: ClientOptions) {
        this.options = options;
        this.client = new GoogleGenAI({
            apiKey: options.apiKey,
        });
    }

    async chat(
        model: IModel,
        history: IMessage[],
        tools?: Tool[],
        options?: Options
    ): Promise<IMessage> {
        // Extract system messages for system instructions
        const systemMessages = history.filter(m => m.role === 'system');
        const nonSystemMessages = history.filter(m => m.role !== 'system');

        // Convert non-system messages to Gemini format
        const messages = nonSystemMessages.map(m => GeminiMessage.from(m)).compact();

        const config: GenerateContentConfig = {
            temperature: options?.temperature,
        };

        // Add system instruction if system messages exist
        if (systemMessages.length > 0) {
            // Combine all system messages into one instruction
            const systemInstruction = systemMessages.map(m => m.content).join('\n\n');
            config.systemInstruction = {
                parts: [{ text: systemInstruction }],
            };
        }

        if (tools && tools.length) {
            config.tools = GeminiTools.from(tools);
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

        return {
            model: model.name,
            name: '',
            role: 'assistant',
            content: text || '',
            toolCalls,
        };
    }

    async models(): Promise<IModel[]> {
        return (await this.client.models.list()).page.map(model => {
            const metadata = model;
            const name = metadata.name?.replace('models/', '') as string;

            return {
                id: `gemini:${name}`,
                name,
                metadata,
                engineId: this.options.engine.id,
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
            engineId: this.options.engine.id,
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
