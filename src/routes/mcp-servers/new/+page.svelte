<script lang="ts">
    import { McpServer } from '$lib/models';
    import McpServerPage from '$components/Mcp/Page.svelte';
    import { goto } from '$app/navigation';

    const server: McpServer = $state(McpServer.new());

    async function onsave(server: McpServer) {
        await goto(`/mcp-servers/${server.id}`);
    }
</script>

<McpServerPage {server} {onsave} />
