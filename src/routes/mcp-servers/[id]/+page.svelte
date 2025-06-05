<script lang="ts">
    import { page } from '$app/state';

    import McpServerView from '$components/McpServer.svelte';
    import McpServer from '$lib/models/mcp-server.svelte';

    const server: McpServer = $derived(McpServer.find(Number(page.params.id)));
</script>

<McpServerView {server} />
