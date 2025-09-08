<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';

    import List from '$components/List.svelte';
    import ServerToggled from '$components/Mcp/ServerToggled.svelte';
    import { McpServer } from '$lib/models';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        servers: McpServer[];
        enabled: (mcpServer: McpServer) => boolean;
        onadd: (mcpServer: McpServer) => Promise<unknown> | unknown;
        onremove: (mcpServer: McpServer) => Promise<unknown> | unknown;
    }

    const { servers, enabled, onadd, onremove }: Props = $props();
</script>

{#snippet Server(mcpServer: McpServer)}
    <ServerToggled {mcpServer} enabled={enabled(mcpServer)} onenable={onadd} ondisable={onremove} />
{/snippet}

<List
    items={servers}
    itemView={Server}
    filterable
    filterProp="name"
    class="border-light rounded-md border"
/>
