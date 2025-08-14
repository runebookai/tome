import { invoke } from '@tauri-apps/api/core';

import type { Tool } from '$lib/engines/types';

export interface McpConfig {
    command: string;
    args: string[];
    env: Record<string, string>;
}

export interface McpTool {
    name: string;
    description: string;
    inputSchema: McpInputSchema;
}

export interface McpInputSchema {
    type: string;
    title: string;
    properties: { [k: string]: any }; // eslint-disable-line
    required: string[];
}

// Retrieve, and transform, tools from the MCP server, into `tools` object we
// can send to the LLM.
//
export async function getMcpTools(sessionId: number): Promise<Tool[]> {
    return (await invoke<McpTool[]>('get_mcp_tools', { sessionId })).map(tool => {
        return {
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: {
                    type: 'object',
                    required: tool.inputSchema.required,
                    properties: tool.inputSchema.properties,
                },
            },
        };
    });
}
