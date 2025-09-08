<script lang="ts">
    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
    import Icon from '$components/Icon.svelte';
    import McpServerView from '$components/Mcp/Server.svelte';
    import { McpServer } from '$lib/models';

    interface Props {
        server: McpServer;
        onsave?: (server: McpServer) => Promise<unknown> | unknown;
    }

    const { server, onsave }: Props = $props();
    let error: null | string = $state(null);

    async function save() {
        try {
            const s = await server.save();
            await onsave?.(s);
        } catch {
            error = 'error starting the server';
        }
    }
</script>

<Flex class="flex-col items-start">
    <McpServerView {server} />

    <Flex class="mt-4">
        <Button class="border-purple text-purple uppercase" onclick={save}>Save</Button>

        {#if error}
            <Flex class="text-red ml-4">
                <Icon name="Error" class="mr-2 h-4 w-4" />
                {error}
            </Flex>
        {/if}
    </Flex>
</Flex>
