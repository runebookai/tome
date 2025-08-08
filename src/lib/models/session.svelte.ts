import moment from 'moment';

import type { Tool } from '$lib/engines/types';
import { getMcpTools } from '$lib/mcp';
import { App, McpServer, Message, Model, Setting } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';
import { DEFAULT_SUMMARY } from '$lib/summarize';

/**
 * Generic context for the LLM.
 */
export const SYSTEM_PROMPT =
    'You are Tome, created by Runebook, which is an software company located in Oakland, CA. You are a helpful assistant.';

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
    relay: string;
    created: string;
    modified: string;
}

export default class Session extends Base<Row>('sessions') {
    id?: number = $state();
    appId?: number = $state();
    summary: string = $state(DEFAULT_SUMMARY);
    config: Partial<Config> = $state({});
    ephemeral: boolean = $state(false);
    relay: boolean = $state(false);
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
        return Message.where({ sessionId: this.id });
    }

    get mcpServers(): McpServer[] {
        return (this.config.enabledMcpServers || [])
            .map(name => McpServer.findBy({ name }))
            .compact();
    }

    async start() {
        await this.mcpServers.awaitAll(async s => await s.start(this));
    }

    async stop() {
        await this.mcpServers.awaitAll(async s => await s.stop(this));
    }

    async tools(): Promise<Tool[]> {
        return this.id ? await getMcpTools(this.id) : [];
    }

    hasUserMessages(): boolean {
        return Message.exists({ sessionId: this.id, role: 'user' });
    }

    hasMcpServer(server: string): boolean {
        return !!this.config.enabledMcpServers?.includes(server);
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

        this.config.enabledMcpServers?.push(server.name);
        return await this.save();
    }

    async removeMcpServer(server: McpServer): Promise<Session> {
        this.config.enabledMcpServers = this.config.enabledMcpServers?.filter(
            s => s !== server.name
        );
        return await this.save();
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
            relay: row.relay === 'true',
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
            relay: this.relay ? 'true' : 'false',
        };
    }
}
