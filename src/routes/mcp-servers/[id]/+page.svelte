<script lang="ts">
    import { page } from '$app/state';
    import { McpServer } from '$lib/models';
    import McpServerPage from '$components/Mcp/Page.svelte';

    const server: McpServer = $derived(McpServer.find(Number(page.params.id)));
</script>

{#key page.params.id}
    <McpServerPage {server} />
{/key}
