import type { IEngine, IMessage, IModel } from '$lib/models';

export interface Client {
    chat(model: IModel, history: IMessage[], tools?: Tool[], options?: Options): Promise<IMessage>;
    models(): Promise<IModel[]>;
    info(model: string): Promise<IModel>;
    connected(): Promise<boolean>;
}

export interface ClientOptions {
    engine: IEngine;
    apiKey: string;
    url: string;
}

export interface Options {
    num_ctx?: number;
    temperature?: number;
}

export type Role =
    | 'system'
    | 'user'
    | 'assistant'
    | 'tool'
    | 'function'
    | 'developer' // openai
    | 'model'; // gemini

export interface Message {
    role: Role;
    content: string;
    name?: string;
    tool_calls?: ToolCall[];
}

export interface ToolCall {
    id?: string;
    type?: 'function';
    function: {
        name: string;
        arguments: {
            [key: string]: any; // eslint-disable-line
        };
    };
}

export interface Tool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            required: string[];
            properties: Record<string, Property>;
        };
    };
}

export interface Property {
    type: string;
    description: string;
}
