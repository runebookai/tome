<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';

    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Modal from '$components/Modal.svelte';
    import Svg from '$components/Svg.svelte';
    import type { VSCodeMcpInstallConfig } from '$lib/deeplinks';
    import { McpServer } from '$lib/models';

    const payload = page.url.searchParams.get('config') as string;
    const config: VSCodeMcpInstallConfig = JSON.parse(decodeURIComponent(payload));

    // Determine transport type for compatibility
    const transport = config.transport || (config.type === 'http' ? 'http' : 'stdio');

    async function install() {
        // Create the server configuration based on transport type
        const serverConfig = {
            name: config.name,
            command: config.command || '',
            args: config.args || [],
            env: {},
            transportType: transport,
            transportConfig:
                transport === 'http'
                    ? {
                          url: config.url,
                          authentication: config.authentication || { type: 'none' as const },
                          headers: config.headers || {},
                          timeout: config.timeout || 30,
                          retries: config.retries || 3,
                      }
                    : {
                          authentication: { type: 'none' as const },
                      },
        };

        const server = await McpServer.create(serverConfig);
        goto(`/mcp-servers/${server.name}`);
    }

    function cancel() {
        goto('/mcp-servers');
    }
</script>

<Layout>
    <Modal close={cancel}>
        {#if transport !== 'stdio' && transport !== 'http'}
            <Flex class="text-red w-full">
                <Svg name="Warning" class="mr-8 h-6 w-6" />
                <p>
                    Tome only supports <code>stdio</code>
                    and
                    <code>http</code>
                    MCP servers
                </p>
            </Flex>
        {:else}
            <Flex class="w-full flex-col items-start">
                <h2 class="ml-2">Install {config.name}?</h2>

                {#if transport === 'http'}
                    <Flex class="border-light mt-4 w-full flex-col items-start rounded-md border">
                        <h3 class="text-medium p-2 pl-4 text-sm">HTTP Endpoint</h3>
                        <Flex class="border-t-light w-full overflow-x-scroll border-t p-2 pl-4">
                            <code class="whitespace-nowrap">
                                {config.url}
                            </code>
                        </Flex>
                    </Flex>

                    {#if config.authentication && config.authentication.type !== 'none'}
                        <Flex
                            class="border-light mt-4 w-full flex-col items-start rounded-md border"
                        >
                            <h3 class="text-medium p-2 pl-4 text-sm">Authentication</h3>
                            <Flex class="border-t-light w-full overflow-x-scroll border-t p-2 pl-4">
                                <code class="whitespace-nowrap">
                                    {config.authentication.type}
                                    {#if config.authentication.type === 'bearer' && config.authentication.token}
                                        (Token: {config.authentication.token.substring(0, 10)}...)
                                    {:else if config.authentication.type === 'basic' && config.authentication.username}
                                        (Username: {config.authentication.username})
                                    {/if}
                                </code>
                            </Flex>
                        </Flex>
                    {/if}

                    {#if config.headers && Object.keys(config.headers).length > 0}
                        <Flex
                            class="border-light mt-4 w-full flex-col items-start rounded-md border"
                        >
                            <h3 class="text-medium p-2 pl-4 text-sm">Headers</h3>
                            <Flex class="border-t-light w-full overflow-x-scroll border-t p-2 pl-4">
                                <code class="whitespace-nowrap">
                                    {Object.entries(config.headers)
                                        .map(([k, v]) => `${k}: ${v}`)
                                        .join(', ')}
                                </code>
                            </Flex>
                        </Flex>
                    {/if}
                {:else}
                    <Flex class="border-light mt-4 w-full flex-col items-start rounded-md border">
                        <h3 class="text-medium p-2 pl-4 text-sm">Command</h3>
                        <Flex class="border-t-light w-full overflow-x-scroll border-t p-2 pl-4">
                            <code class="whitespace-nowrap">
                                {config.command}
                                {config.args?.join(' ') || ''}
                            </code>
                        </Flex>
                    </Flex>
                {/if}

                <Flex class="mt-8 self-end">
                    <Button onclick={cancel} class="text-medium border-0">Cancel</Button>
                    <Button onclick={install} class="border-purple text-purple">Install</Button>
                </Flex>
            </Flex>
        {/if}
    </Modal>
</Layout>
