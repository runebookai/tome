<script lang="ts">
    import { page } from '$app/state';

    import McpServerPage from '$components/Mcp/Page.svelte';
    import { McpServer } from '$lib/models';

    const server: McpServer = $derived(McpServer.find(Number(page.params.id)));
</script>

{#key page.params.id}
    <McpServerPage {server} />
{/key}
