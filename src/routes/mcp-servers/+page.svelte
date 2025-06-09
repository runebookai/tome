<script lang="ts">
    import { goto } from '$app/navigation';

    import { McpServer } from '$lib/models';

    const server: McpServer = McpServer.last();

    if (server) {
        goto(`/mcp-servers/${server.name}`);
    } else {
        goto('/mcp-servers/smithery');
    }
</script>
