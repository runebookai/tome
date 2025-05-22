<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';

    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Modal from '$components/Modal.svelte';
    import Svg from '$components/Svg.svelte';
    import type { VSCodeMcpInstallConfig } from '$lib/deeplinks';
    import McpServer from '$lib/models/mcp-server';

    const payload = page.url.searchParams.get('config') as string;
    const config: VSCodeMcpInstallConfig = JSON.parse(decodeURIComponent(payload));

    async function install() {
        const server = await McpServer.create(config);
        goto(`/mcp-servers/${server.name}`);
    }

    function cancel() {
        goto('/mcp-servers');
    }
</script>

<Layout>
    <Modal close={cancel}>
        {#if config.type !== 'stdio'}
            <Flex class="text-red w-full">
                <Svg name="Warning" class="mr-8 h-6 w-6" />
                <p>Tome only supports <code>stdio</code> MCP servers</p>
            </Flex>
        {:else}
            <Flex class="w-full flex-col items-start">
                <h2 class="ml-2">Install {config.name}?</h2>

                <Flex class="border-light mt-4 w-full flex-col items-start rounded-md border">
                    <h3 class="text-medium p-2 pl-4 text-sm">Command</h3>
                    <Flex class="border-t-light w-full overflow-x-scroll border-t p-2 pl-4">
                        <code class="whitespace-nowrap">
                            {config.command}
                            {config.args.join(' ')}
                        </code>
                    </Flex>
                </Flex>

                <Flex class="mt-8 self-end">
                    <Button onclick={cancel} class="text-medium border-0">Cancel</Button>
                    <Button onclick={install} class="border-purple text-purple">Install</Button>
                </Flex>
            </Flex>
        {/if}
    </Modal>
</Layout>
