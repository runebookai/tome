import { invoke } from "@tauri-apps/api/core";

import type { LlmTool } from "$lib/llm";
import type { McpTool } from "$lib/mcp.d";
import type { ISession } from "$lib/models/session";

export * from '$lib/mcp.d';

// Retrieve, and transform, tools from the MCP server, into `tools` object we
// can send to the LLM.
//
export async function getMCPTools(session: ISession): Promise<LlmTool[]> {
    return (
        await invoke<McpTool[]>('get_mcp_tools', { sessionId: session.id })
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
