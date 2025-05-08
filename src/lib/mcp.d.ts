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
    properties: { [k: string]: any; }; // eslint-disable-line
    required: string[];
}
