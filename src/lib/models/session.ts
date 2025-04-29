import moment from "moment";

import * as llm from '$lib/llm';
import { getMCPTools } from '$lib/mcp';
import App, { type IApp } from '$lib/models/app';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';
import McpServer, { type IMcpServer } from "$lib/models/mcp-server";
import Message, { type IMessage } from "$lib/models/message";
import Model from '$lib/models/model.svelte';

export const DEFAULT_SUMMARY = 'Untitled';
export interface ISession {
    id?: number;
    appId?: number;
    summary: string;
    config: {
        model: string;
        contextWindow: number;
        temperature: number;
        enabledMcpServers: string[];
    };
    created?: moment.Moment;
    modified?: moment.Moment;
}

interface Row {
    id: number;
    app_id: number;
    summary: string;
    config: string;
    created: string;
    modified: string;
}

export default class Session extends Base<ISession, Row>('sessions') {
    static default(): ISession {
        return {
            summary: DEFAULT_SUMMARY,
            config: {
                model: Model.default().name,
                contextWindow: 4096,
                temperature: 0.8,
                enabledMcpServers: [],
            }
        }
    }

    static app(session: ISession): IApp | undefined {
        if (!session.appId) return;
        return App.find(session.appId);
    }

    static messages(session: ISession): IMessage[] {
        if (!session.id) return [];
        return Message.findBy({ sessionId: session.id });
    }

    static async tools(session: ISession): Promise<llm.Tool[]> {
        const model = Model.find(session.config.model);

        if (!Model.supportsTools(model)) {
            return [];
        }

        return await getMCPTools(session);
    }

    static async addMessage(session: ISession, message: Partial<IMessage>): Promise<IMessage> {
        return await Message.create({
            sessionId: session.id,
            model: session.config.model,
            ...message
        });
    }

    static hasMcpServer(session: ISession, server: string): boolean {
        return session.config.enabledMcpServers.includes(server);
    }

    static async addMcpServer(session: ISession, server: IMcpServer): Promise<ISession> {
        const name = McpServer.name(server);

        if (this.hasMcpServer(session, name)) {
            return session;
        }

        session.config.enabledMcpServers.push(name);
        return await this.update(session);
    }

    static async removeMcpServer(session: ISession, server: IMcpServer): Promise<ISession> {
        session.config.enabledMcpServers = session
            .config
            .enabledMcpServers
            .filter(s => s !== McpServer.name(server));
        return await this.update(session);
    }

    static async summarize(session: ISession, model: string) {
        if (!session.id) {
            return;
        }

        if (!this.hasUserMessages(session) || session.summary !== DEFAULT_SUMMARY) {
            return;
        }

        const client = new llm.Client();
        const message: IMessage = await client.chat(
            model,
            [
                ...this.messages(session),
                {
                    role: 'user',
                    content: 'Summarize all previous messages in a concise and comprehensive manner. The summary can be 3 words or less. Only respond with the summary and nothing else. Remember, the length of the summary can be 3 words or less.',
                    name: '',
                    tool_calls: [],
                }
            ]
        );

        // Some smaller models add extra explanation after a ";"
        session.summary = message.content.split(";")[0];

        // They also sometimes put the extra crap before "Summary: "
        session.summary = session.summary.split(/[Ss]ummary: /).pop() as string;

        this.update(session);
    }

    static hasUserMessages(session: ISession): boolean {
        return Message.exists({ sessionId: session.id, role: 'user' });
    }

    protected static async afterCreate(session: ISession): Promise<ISession> {
        await Message.create({
            sessionId: session.id,
            role: 'system',
            content: 'You are Tome, created by Runebook, which is an software company located in Oakland, CA. You are a helpful assistant.',
        });

        await Message.create({
            sessionId: session.id,
            role: 'assistant',
            content: "Hey there, what's on your mind?",
        });

        return session;
    }

    protected static async fromSql(row: Row): Promise<ISession> {
        return {
            id: row.id,
            appId: row.app_id,
            summary: row.summary,
            config: JSON.parse(row.config),
            created: moment.utc(row.created),
            modified: moment.utc(row.modified),
        };
    }

    protected static async toSql(session: ISession): Promise<ToSqlRow<Row>> {
        return {
            app_id: session.appId as number,
            summary: session.summary,
            config: JSON.stringify(session.config),
        };
    }
}
