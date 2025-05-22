<script lang="ts">
    import McpServerView from '$components/McpServer.svelte';
    import McpServer, { type IMcpServer } from '$lib/models/mcp-server';

    const server: IMcpServer = $state(McpServer.default());
</script>

<McpServerView {server} />
