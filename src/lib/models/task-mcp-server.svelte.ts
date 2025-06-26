import { McpServer, Task } from '$lib/models';
import Base, { type ToSqlRow } from '$lib/models/base.svelte';

interface Row {
    id: number;
    task_id: number;
    mcp_server_id: number;
}

export default class TaskMcpServer extends Base<Row>('tasks_mcp_servers') {
    taskId?: number = $state();
    mcpServerId?: number = $state();

    get task() {
        return Task.find(Number(this.taskId));
    }

    get mcpServer() {
        return McpServer.find(Number(this.mcpServerId));
    }

    protected static async fromSql(row: Row): Promise<TaskMcpServer> {
        return TaskMcpServer.new({
            id: row.id,
            taskId: row.task_id,
            mcpServerId: row.mcp_server_id,
        });
    }

    protected async toSql(): Promise<ToSqlRow<Row>> {
        return {
            task_id: Number(this.taskId),
            mcp_server_id: Number(this.mcpServerId),
        };
    }
}
