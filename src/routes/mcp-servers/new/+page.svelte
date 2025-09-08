<script lang="ts">
    import { goto } from '$app/navigation';

    import McpServerPage from '$components/Mcp/Page.svelte';
    import { McpServer } from '$lib/models';

    const server: McpServer = $state(McpServer.new());

    async function onsave(server: McpServer) {
        await goto(`/mcp-servers/${server.id}`);
    }
</script>

<McpServerPage {server} {onsave} />
