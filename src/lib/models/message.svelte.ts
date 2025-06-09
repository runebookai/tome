import moment from 'moment';

import type { Role, ToolCall } from '$lib/engines/types';
import { Session, type ToSqlRow } from '$lib/models';
import Base from '$lib/models/base.svelte';

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

export default class Message extends Base<Row>('messages') {
    id?: number = $state();
    role: Role = $state('user');
    content: string = $state('');
    thought?: string = $state();
    model: string = $state('');
    name: string = $state('');
    toolCalls: ToolCall[] = $state([]);
    sessionId?: number = $state();
    responseId?: number = $state();
    toolCallId?: string = $state();
    created?: moment.Moment = $state();
    modified?: moment.Moment = $state();

    get defaults() {
        return {
            role: 'user',
            content: '',
            model: '',
            name: '',
            toolCalls: [],
        };
    }

    get response(): Message | undefined {
        return Message.findBy({ toolCallId: this.toolCalls[0].id });
    }

    get session(): Session {
        return Session.find(this.sessionId as number);
    }

    protected async afterCreate() {
        const session = Session.find(this.sessionId as number);
        await session.summarize();
    }

    protected static async fromSql(row: Row): Promise<Message> {
        return Message.new({
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
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            role: this.role,
            content: this.content,
            thought: this.thought,
            model: this.model,
            name: this.name,
            tool_calls: JSON.stringify(this.toolCalls),
            session_id: this.sessionId as number,
            response_id: this.responseId,
            tool_call_id: this.toolCallId,
        };
    }
}
