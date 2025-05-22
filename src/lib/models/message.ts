import moment from 'moment';

import type { Role, ToolCall } from '$lib/engines/types';
import Model, { type ToSqlRow } from '$lib/models/base.svelte';
import Session, { type ISession } from '$lib/models/session';

export interface IMessage {
    id?: number;
    role: Role;
    content: string;
    thought?: string;
    model: string;
    name: string;
    toolCalls: ToolCall[];
    sessionId?: number;
    responseId?: number;
    toolCallId?: string;
    created?: moment.Moment;
    modified?: moment.Moment;
}

interface Row {
    id: number;
    role: string;
    content: string;
    thought?: string;
    model: string;
    name: string;
    tool_calls: string;
    session_id: number;
    response_id?: number;
    tool_call_id?: string;
    created: string;
    modified: string;
}

export default class Message extends Model<IMessage, Row>('messages') {
    static defaults = {
        role: 'user',
        content: '',
        model: '',
        name: '',
        toolCalls: [],
    };

    static response(message: IMessage): IMessage | undefined {
        return Message.findBy({ toolCallId: message.toolCalls[0].id });
    }

    static session(message: IMessage): ISession {
        return Session.find(message.sessionId as number);
    }

    protected static async afterCreate(message: IMessage): Promise<IMessage> {
        const session = Session.find(message.sessionId as number);
        await Session.summarize(session, session.config.model);
        return message;
    }

    protected static async fromSql(row: Row): Promise<IMessage> {
        return {
            id: row.id,
            role: row.role as Role,
            content: row.content,
            thought: row.thought,
            model: row.model,
            name: row.name,
            toolCalls: JSON.parse(row.tool_calls),
            sessionId: row.session_id,
            responseId: row.response_id,
            toolCallId: row.tool_call_id,
            created: moment.utc(row.created),
            modified: moment.utc(row.modified),
        };
    }

    protected static async toSql(message: IMessage): Promise<ToSqlRow<Row>> {
        return {
            role: message.role,
            content: message.content,
            thought: message.thought,
            model: message.model,
            name: message.name,
            tool_calls: JSON.stringify(message.toolCalls),
            session_id: message.sessionId as number,
            response_id: message.responseId,
            tool_call_id: message.toolCallId,
        };
    }
}
