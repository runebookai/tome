<script lang="ts">
    import { goto } from '$app/navigation';

    import McpServer, { type IMcpServer } from '$lib/models/mcp-server';

    const server: IMcpServer = McpServer.last();

    if (server) {
        goto(`/mcp-servers/${server.name}`);
    } else {
        goto('/mcp-servers/smithery');
    }
</script>
