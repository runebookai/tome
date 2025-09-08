import { invoke } from '@tauri-apps/api/core';

import type { Tool } from '$lib/engines/types';
import type { McpTool } from '$lib/mcp/types';
export type { McpConfig, McpInputSchema, McpTool } from '$lib/mcp/types';

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
