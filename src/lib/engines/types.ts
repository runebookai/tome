import { type IModel, Message as TomeMessage } from '$lib/models';

export interface Client {
    chat(
        model: IModel,
        history: TomeMessage[],
        tools?: Tool[],
        options?: Options
    ): Promise<TomeMessage>;
    models(): Promise<IModel[]>;
    info(model: string): Promise<IModel>;
    connected(): Promise<boolean>;
}

export interface ClientOptions {
    apiKey: string;
    url: string;
}

export interface ClientProps extends ClientOptions {
    engineId: number;
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
