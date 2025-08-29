<script lang="ts">
    import Flex from './Flex.svelte';
    import ServerToggled from './Mcp/ServerToggled.svelte';
    import Toggle from './Toggle.svelte';

    import List from '$components/List.svelte';
    import { McpServer } from '$lib/models';

    const { hasMcpServer, addMcpServer, removeMcpServer } = $props();
</script>

{#snippet Server(mcpServer: McpServer)}
    <ServerToggled {mcpServer} />
{/snippet}

<List
    items={McpServer.all()}
    itemView={Server}
    filterable
    filterProp="name"
    class="border-light rounded-md border"
/>
