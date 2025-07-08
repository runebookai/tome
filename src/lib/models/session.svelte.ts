import moment from 'moment';

import Engine from './engine.svelte';

import type { Tool } from '$lib/engines/types';
import { getMCPTools } from '$lib/mcp';
import { App, McpServer, Message, Model, Setting } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

/**
 * Generic context for the LLM.
 */
export const SYSTEM_PROMPT =
    'You are Tome, created by Runebook, which is an software company located in Oakland, CA. You are a helpful assistant.';

/**
 * Prompt to retrieve a summary of the conversation so far.
 */
export const SUMMARY_PROMPT =
    'Summarize all previous messages in a concise and comprehensive manner. The summary can be 3 words or less. Only respond with the summary and nothing else. Remember, the length of the summary can be 3 words or less.';

/**
 * Default summary before summarization via LLM.
 */
export const DEFAULT_SUMMARY = 'Untitled';

/**
 * The first message a User sees in a chat.
 */
export const WELCOME_PROMPT = "Hey there, what's on your mind?";

interface Config {
    model: string;
    engineId: number;
    contextWindow: number;
    temperature: number;
    enabledMcpServers: string[];
}

interface Row {
    id: number;
    app_id: number;
    summary: string;
    config: string;
    ephemeral: string;
    created: string;
    modified: string;
}

export default class Session extends Base<Row>('sessions') {
    id?: number = $state();
    appId?: number = $state();
    summary: string = $state(DEFAULT_SUMMARY);
    config: Partial<Config> = $state({});
    ephemeral: boolean = $state(false);
    created?: moment.Moment = $state();
    modified?: moment.Moment = $state();

    get default() {
        const model = Model.default();
        return {
            config: {
                model: model.id,
                engineId: model.engineId,
                contextWindow: 4096,
                temperature: 0.8,
                enabledMcpServers: [],
            },
        };
    }

    get app(): App | undefined {
        if (!this.appId) return;
        return App.find(this.appId);
    }

    get messages(): Message[] {
        if (!this.appId) return [];
        return Message.where({ sessionId: this.id });
    }

    get mcpServers(): McpServer[] {
        return (this.config.enabledMcpServers || [])
            .map(name => McpServer.findBy({ name }))
            .compact();
    }

    get mcpServersByTransport(): { stdio: McpServer[], http: McpServer[] } {
        const servers = this.mcpServers;
        return {
            stdio: servers.filter(server => server.transportType === 'stdio'),
            http: servers.filter(server => server.transportType === 'http')
        };
    }

    async start() {
        const results = await Promise.allSettled(
            this.mcpServers.map(async server => {
                try {
                    await server.start(this);
                    return { server: server.name, transport: server.transportType, success: true };
                } catch (error) {
                    console.error(`Failed to start MCP server ${server.name} (${server.transportType}):`, error);
                    return { server: server.name, transport: server.transportType, success: false, error };
                }
            })
        );
        
        // Log any failures for debugging
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Failed to start MCP server ${this.mcpServers[index].name} (${this.mcpServers[index].transportType}):`, result.reason);
            }
        });
        
        return results;
    }

    async stop() {
        const results = await Promise.allSettled(
            this.mcpServers.map(async server => {
                try {
                    await server.stop(this);
                    return { server: server.name, transport: server.transportType, success: true };
                } catch (error) {
                    console.error(`Failed to stop MCP server ${server.name} (${server.transportType}):`, error);
                    return { server: server.name, transport: server.transportType, success: false, error };
                }
            })
        );
        
        // Log any failures for debugging
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Failed to stop MCP server ${this.mcpServers[index].name} (${this.mcpServers[index].transportType}):`, result.reason);
            }
        });
        
        return results;
    }

    async tools(): Promise<Tool[]> {
        if (!this.id || !this.config?.model) {
            return [];
        }

        if (!Model.find(this.config.model)?.supportsTools) {
            return [];
        }

        return await getMCPTools(this.id);
    }

    hasUserMessages(): boolean {
        return Message.exists({ sessionId: this.id, role: 'user' });
    }

    hasMcpServer(server: string): boolean {
        return !!this.config.enabledMcpServers?.includes(server);
    }

    getMcpServerStatus(server: McpServer): 'enabled' | 'disabled' | 'unconfigured' {
        if (!server.isConfigured) {
            return 'unconfigured';
        }
        return this.hasMcpServer(server.name) ? 'enabled' : 'disabled';
    }

    getMcpServerDisplayInfo(server: McpServer): string {
        const status = this.getMcpServerStatus(server);
        const transportInfo = server.displayInfo;
        
        switch (status) {
            case 'unconfigured':
                return `${transportInfo} (Not configured)`;
            case 'enabled':
                return `${transportInfo} (Active)`;
            case 'disabled':
                return `${transportInfo} (Inactive)`;
            default:
                return transportInfo;
        }
    }

    async startMcpServersByTransport(transportType: 'stdio' | 'http'): Promise<any[]> {
        const serversByTransport = this.mcpServersByTransport;
        const serversToStart = transportType === 'stdio' ? serversByTransport.stdio : serversByTransport.http;
        
        const results = await Promise.allSettled(
            serversToStart.map(async server => {
                try {
                    await server.start(this);
                    return { server: server.name, transport: server.transportType, success: true };
                } catch (error) {
                    console.error(`Failed to start ${transportType} MCP server ${server.name}:`, error);
                    return { server: server.name, transport: server.transportType, success: false, error };
                }
            })
        );
        
        return results;
    }

    async stopMcpServersByTransport(transportType: 'stdio' | 'http'): Promise<any[]> {
        const serversByTransport = this.mcpServersByTransport;
        const serversToStop = transportType === 'stdio' ? serversByTransport.stdio : serversByTransport.http;
        
        const results = await Promise.allSettled(
            serversToStop.map(async server => {
                try {
                    await server.stop(this);
                    return { server: server.name, transport: server.transportType, success: true };
                } catch (error) {
                    console.error(`Failed to stop ${transportType} MCP server ${server.name}:`, error);
                    return { server: server.name, transport: server.transportType, success: false, error };
                }
            })
        );
        
        return results;
    }

    async addMessage(message: Partial<Message>): Promise<Message> {
        return await Message.create({
            sessionId: this.id,
            model: this.config.model,
            ...message,
        });
    }

    async addMcpServer(server: McpServer): Promise<Session> {
        if (this.hasMcpServer(server.name)) {
            return this;
        }

        this.config.enabledMcpServers = this.config.enabledMcpServers || [];
        this.config.enabledMcpServers.push(server.name);
        return await this.save();
    }

    async removeMcpServer(server: McpServer): Promise<Session> {
        this.config.enabledMcpServers = this.config.enabledMcpServers?.filter(
            s => s !== server.name
        ) || [];
        return await this.save();
    }

    async summarize() {
        if (!this.id || !this.config.model || !this.config.engineId) {
            return;
        }

        if (!this.hasUserMessages() || this.summary !== DEFAULT_SUMMARY) {
            return;
        }

        const engine = Engine.find(this.config.engineId);
        const model = engine.models.find(m => m.name == this.config.model);

        if (!engine || !engine.client || !model) {
            return;
        }

        const message: Message = await engine.client.chat(model, [
            ...this.messages,
            {
                role: 'user',
                content: SUMMARY_PROMPT,
            } as Message,
        ]);

        // Some smaller models add extra explanation after a ";"
        this.summary = message.content.split(';')[0];

        // They also sometimes put the extra crap before "Summary: "
        this.summary = this.summary.split(/[Ss]ummary: /).pop() as string;

        this.save();
    }

    protected async afterCreate(): Promise<void> {
        await Message.create({
            sessionId: this.id,
            role: 'system',
            content: Setting.CustomSystemPrompt?.trim() || SYSTEM_PROMPT,
        });

        if (!this.ephemeral) {
            await Message.create({
                sessionId: this.id,
                role: 'assistant',
                content: WELCOME_PROMPT,
            });
        }
    }

    protected static async fromSql(row: Row): Promise<Session> {
        return Session.new({
            id: row.id,
            appId: row.app_id,
            summary: row.summary,
            config: JSON.parse(row.config),
            ephemeral: row.ephemeral === 'true',
            created: moment.utc(row.created),
            modified: moment.utc(row.modified),
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            app_id: Number(this.appId),
            summary: this.summary,
            config: JSON.stringify(this.config),
            ephemeral: this.ephemeral ? 'true' : 'false',
        };
    }
}
