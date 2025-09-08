<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';

    import Flex from '$components/Flex.svelte';
    import Server from '$components/Mcp/Server.svelte';
    import Toggle from '$components/Toggle.svelte';
    import { McpServer } from '$lib/models';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        mcpServer: McpServer;
        enabled?: boolean;
        onenable?: (mcpServer: McpServer) => Promise<unknown> | unknown;
        ondisable?: (mcpServer: McpServer) => Promise<unknown> | unknown;
    }

    const { mcpServer, onenable, ondisable, ...rest }: Props = $props();

    let enabled = $state(rest.enabled || false);

    async function enable() {
        enabled = true;
        await onenable?.(mcpServer);
    }

    async function disable() {
        enabled = false;
        await ondisable?.(mcpServer);
    }
</script>

<Flex class="items-start">
    <div class="m-4 w-1/4">
        <Toggle
            class="w-1/3"
            label={mcpServer.name}
            value={enabled ? 'on' : 'off'}
            onenable={enable}
            ondisable={disable}
        />
    </div>

    <div
        class={`${enabled ? 'max-h-96' : 'max-h-0'} border-light w-full
        overflow-hidden border-l transition-all duration-500 ease-in-out`}
    >
        <Server server={mcpServer} class="border-none" />
    </div>
</Flex>
