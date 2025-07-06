<script lang="ts">
    import type { PageProps } from './$types';

    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
    import Input from '$components/Input.svelte';
    import Scrollable from '$components/Scrollable.svelte';
    import Card from '$components/Smithery/Card.svelte';
    import Configuration from '$components/Smithery/Configuration.svelte';
    import type { McpConfig } from '$lib/mcp';
    import McpServer from '$lib/models/mcp-server.svelte';
    import { Client } from '$lib/smithery/client';
    import type { CompactServer, ConfigSchema, Server } from '$lib/smithery/types';
    import { debounce } from '$lib/util.svelte';

    const { data }: PageProps = $props();

    let servers = $state(data.servers);
    let page: number = $state(1);
    let query: string = $state('');

    let serverToInstall: Server | null = $state(null);

    function closeConfigure() {
        serverToInstall = null;
    }

    async function loadNextPage() {
        page += 1;
        servers = servers.concat(await new Client().servers(page));
    }

    async function search() {
        const client = new Client();

        if (query !== '') {
            servers = await client.search(query);
        } else {
            servers = await client.servers();
        }
    }

    function configSchemaFor(server: Server): ConfigSchema {
        return server.connections.findBy('type', 'stdio')?.configSchema || ({} as ConfigSchema);
    }

    async function configure(_server: CompactServer) {
        serverToInstall = await new Client().server(_server.qualifiedName);
    }

    async function install(config: McpConfig) {
        await McpServer.create(config);
        serverToInstall = null;
    }
</script>

{#if serverToInstall}
    <Configuration
        server={serverToInstall}
        config={configSchemaFor(serverToInstall)}
        onCancel={closeConfigure}
        onInstall={install}
    />
{/if}

<Scrollable class="!h-content pr-2">
    <Flex class="w-full">
        <Input
            bind:value={query}
            class="placeholder:text-light mb-8"
            label={false}
            name="search"
            onkeyup={debounce(search)}
            placeholder="Search Smithery..."
        />
    </Flex>

    <Flex class="grid w-full auto-cols-max auto-rows-max grid-cols-3 items-start gap-4">
        {#each servers as server (server.qualifiedName)}
            <Card {server} onInstall={configure} />
        {/each}
    </Flex>

    <Flex class="w-full justify-center">
        <Button onclick={loadNextPage} class="border-light text-medium m-auto mt-8">
            Load More
        </Button>
    </Flex>
</Scrollable>
