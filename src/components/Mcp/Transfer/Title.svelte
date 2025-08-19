<script lang="ts">
    import Flex from '$components/Flex.svelte';
    import Svg from '$components/Svg.svelte';
    import type { SerializedMcpServer } from '$lib/apps';

    interface Props {
        server: SerializedMcpServer;
    }

    const { server }: Props = $props();
</script>

<Flex class="border-light w-full border-b p-4 py-4 pl-6">
    <Svg name="MCP" class="mr-2 h-4 w-4" />
    <p class="font-medium">{server.name}</p>
</Flex>
