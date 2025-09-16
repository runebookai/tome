import moment from 'moment';

import SessionMcpServer from './session-mcp-server.svelte';

import { App, McpServer, Session } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

interface Row {
    id: number;
    session_id: number;
    name: string;
    config: string;
    active: string;
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
    active: boolean = $state(true);
    created?: moment.Moment = $state();
    modified?: moment.Moment = $state();

    get mcpServers(): McpServer[] {
        if (!this.session) return [];
        return this.session.mcpServers;
    }

    get savableMcpServers(): McpServer[] {
        const comp = (a: McpServer, b: McpServer) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase());

        return this.mcpServers.sort(comp).concat(
            McpServer.forChat()
                .filter(s => !this.mcpServers.mapBy('name').includes(s.name))
                .map(s =>
                    McpServer.new({
                        name: s.name,
                        command: s.command,
                        args: s.args,
                        env: s.env,
                        metadata: s.metadata,
                    })
                )
                .sort(comp)
        );
    }

    get session(): Session | undefined {
        if (!this.sessionId) return;
        return Session.find(this.sessionId);
    }

    async delete(): Promise<boolean> {
        if (!this.session || !this.session.isPersisted()) {
            return true;
        }

        await SessionMcpServer.where({ sessionId: this.session.id }).awaitAll(async join => {
            await McpServer.find(join.mcpServerId as number)?.delete();
            await join.delete();
        });

        return await super.delete();
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
            active: row.active === 'true',
            created: moment.utc(row.created),
            modified: moment.utc(row.modified),
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            session_id: Number(this.sessionId),
            name: this.name,
            config: JSON.stringify(this.config),
            active: this.active ? 'true' : 'false',
        };
    }
}
