import { App, McpServer } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

interface Row {
    id: number;
    app_id: number;
    mcp_server_id: number;
}

export default class AppMcpServer extends Base<Row>('apps_mcp_servers') {
    appId?: number = $state();
    mcpServerId?: number = $state();

    get app() {
        return App.find(Number(this.appId));
    }

    get mcpServer() {
        return McpServer.find(Number(this.mcpServerId));
    }

    protected static async fromSql(row: Row): Promise<AppMcpServer> {
        return AppMcpServer.new({
            id: row.id,
            appId: row.app_id,
            mcpServerId: row.mcp_server_id,
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            app_id: Number(this.appId),
            mcp_server_id: Number(this.mcpServerId),
        };
    }
}
