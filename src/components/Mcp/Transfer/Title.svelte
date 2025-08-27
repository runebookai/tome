<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';
    import Svg from '$components/Svg.svelte';
    import type { SerializedMcpServer } from '$lib/apps';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        server: SerializedMcpServer;
    }

    const { server, class: cls = '' }: Props = $props();
</script>

<Flex class={twMerge('w-full p-4 py-4 pl-6', cls?.toString())}>
    <Svg name="MCP" class="mr-2 h-4 w-4" />
    <p class="font-medium">{server.name}</p>
</Flex>
