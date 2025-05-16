import type { IMessage, IModel } from "$lib/models";

export interface Client {
    chat(model: IModel, messages: Message[], tools?: Tool[], options?: Options): Promise<IMessage>;
    models(): Promise<IModel[]>;
    info(model: string): Promise<IModel>;
    connected(): Promise<boolean>;
}

export interface Options {
    num_ctx?: number;
    temperature?: number;
}

export type Role =
    | 'developer'
    | 'system'
    | 'user'
    | 'assistant'
    | 'tool'
    | 'function';

export interface Message {
    role: Role;
    content: string;
    name: string;
    tool_calls?: ToolCall[];
}

export interface ToolCall {
    function: {
        name: string;
        arguments: {
            [key: string]: any; // eslint-disable-line
        }
    }
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
        }
    }
}

interface Property {
    type: string;
    description: string;
}
