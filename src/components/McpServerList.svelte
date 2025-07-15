<script lang="ts">
    import Flex from './Flex.svelte';
    import Toggle from './Toggle.svelte';

    import List from '$components/List.svelte';
    import { McpServer } from '$lib/models';

    const { hasMcpServer, addMcpServer, removeMcpServer } = $props();
</script>

{#snippet McpServerView(mcpServer: McpServer)}
    <Flex class="px-3 py-2">
        <Toggle
            label={mcpServer.name}
            value={hasMcpServer(mcpServer) ? 'on' : 'off'}
            onEnable={async () => await addMcpServer(mcpServer)}
            onDisable={async () => await removeMcpServer(mcpServer)}
        />
    </Flex>
{/snippet}

<List
    items={McpServer.all()}
    itemView={McpServerView}
    filterable
    filterProp="name"
    class="border-xlight rounded-md border"
/>
