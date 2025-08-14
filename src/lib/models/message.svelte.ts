import moment from 'moment';

import type { Role, ToolCall } from '$lib/engines/types';
import { Session } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';
import { summarize } from '$lib/summarize';

interface Row {
    id: number;
    session_id: number;
    engine_id?: number;
    tool_call_id?: string;
    model: string;
    role: string;
    content: string;
    thought?: string;
    name: string;
    tool_calls: string;
    created: string;
    modified: string;
}

export default class Message extends Base<Row>('messages') {
    id?: number = $state();
    sessionId?: number = $state();
    engineId?: number = $state();
    toolCallId?: string = $state();
    model: string = $state('');
    role: Role = $state('user');
    content: string = $state('');
    thought?: string = $state();
    name: string = $state('');
    toolCalls: ToolCall[] = $state([]);
    created?: moment.Moment = $state();
    modified?: moment.Moment = $state();

    get response(): Message | undefined {
        return Message.findBy({ toolCallId: this.toolCalls[0].id });
    }

    get session(): Session {
        return Session.find(this.sessionId as number);
    }

    protected async afterCreate() {
        const session = Session.find(this.sessionId as number);
        await summarize(session);
    }

    protected static async fromSql(row: Row): Promise<Message> {
        return Message.new({
            id: row.id,
            sessionId: row.session_id,
            engineId: row.engine_id,
            toolCallId: row.tool_call_id,
            model: row.model,
            role: row.role as Role,
            content: row.content,
            thought: row.thought,
            name: row.name,
            toolCalls: JSON.parse(row.tool_calls),
            created: moment.utc(row.created),
            modified: moment.utc(row.modified),
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            session_id: this.sessionId as number,
            engine_id: this.engineId,
            tool_call_id: this.toolCallId,
            model: this.model,
            role: this.role,
            content: this.content,
            thought: this.thought,
            name: this.name,
            tool_calls: JSON.stringify(this.toolCalls),
        };
    }
}
