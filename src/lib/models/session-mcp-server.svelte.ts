import { McpServer, Session } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

interface Row {
    id: number;
    session_id: number;
    mcp_server_id: number;
}

export default class SessionMcpServer extends Base<Row>('sessions_mcp_servers') {
    sessionId?: number = $state();
    mcpServerId?: number = $state();

    get session() {
        return Session.find(Number(this.sessionId));
    }

    get mcpServer() {
        return McpServer.find(Number(this.mcpServerId));
    }

    protected static async fromSql(row: Row): Promise<SessionMcpServer> {
        return SessionMcpServer.new({
            id: row.id,
            sessionId: row.session_id,
            mcpServerId: row.mcp_server_id,
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            session_id: Number(this.sessionId),
            mcp_server_id: Number(this.mcpServerId),
        };
    }
}
