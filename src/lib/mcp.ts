import { invoke } from "@tauri-apps/api/core";

import * as llm from '$lib/llm';
import type { ISession } from "$lib/models/session";

export interface Tool {
    name: string;
    description: string;
    inputSchema: InputSchema;
}

export interface InputSchema {
    type: string;
    title: string;
    properties: { [k: string]: any; }; // eslint-disable-line
    required: string[];
}

// Retrieve, and transform, tools from the MCP server, into `tools` object we
// can send to the LLM.
//
export async function getMCPTools(session: ISession): Promise<llm.Tool[]> {
    return (
        await invoke<Tool[]>('get_mcp_tools', { sessionId: session.id })
    ).map(tool => {
        return {
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: {
                    type: 'object',
                    required: tool.inputSchema.required,
                    properties: tool.inputSchema.properties,
                }
            }
        };
    });
}
