import moment from 'moment';

import { App, McpServer, Session } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

interface Row {
    id: number;
    session_id: number;
    name: string;
    config: string;
    created: string;
    modified: string;
}

export interface RelayConfig {
    api_key?: string;
    offset?: number;
}

export default class Relay extends Base<Row>('relays') {
    id?: number = $state();
    sessionId?: number = $state();
    name: string = $state('');
    config: RelayConfig = $state({});
    created?: moment.Moment = $state();
    modified?: moment.Moment = $state();

    get mcpServers(): McpServer[] {
        if (!this.session) return [];
        return this.session.mcpServers;
    }

    get session(): Session | undefined {
        if (!this.sessionId) return;
        return Session.find(this.sessionId);
    }

    protected async afterSave() {
        if (this.sessionId) return;

        const session = await Session.create({ appId: App.RELAY.id, relay: true });
        this.sessionId = session.id;
        this.save();
    }

    protected static async fromSql(row: Row): Promise<Relay> {
        return Relay.new({
            id: row.id,
            sessionId: row.session_id,
            name: row.name,
            config: JSON.parse(row.config),
            created: moment.utc(row.created),
            modified: moment.utc(row.modified),
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            session_id: Number(this.sessionId),
            name: this.name,
            config: JSON.stringify(this.config),
        };
    }
}
