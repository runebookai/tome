<script lang="ts">
    import { goto } from '$app/navigation';

    import Flex from '$components/Flex.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Link from '$components/Link.svelte';
    import List from '$components/List.svelte';
    import type { MenuItem } from '$components/Menu.svelte';
    import Menu from '$components/Menu.svelte';
    import Scrollable from '$components/Scrollable.svelte';
    import Svg from '$components/Svg.svelte';
    import Titlebar from '$components/Titlebar.svelte';
    import { McpServer } from '$lib/models';

    interface Registry {
        name: string;
        icon: string;
    }

    const { children } = $props();

    let mcpServers: McpServer[] = $derived(McpServer.forChat());
    let registries: Registry[] = [
        {
            name: 'Smithery',
            icon: 'Smithery',
        },
    ];

    let isRenaming = $state(false);
    let newName = $state('');
    let renamingServer: McpServer | null = $state(null);

    function items(server: McpServer): MenuItem[] {
        return [
            {
                label: 'Rename',
                onclick: () => {
                    newName = server.name;
                    renamingServer = server;
                    isRenaming = true;
                },
            },
            {
                label: 'Delete',
                style: 'text-red hover:bg-red hover:text-white',
                onclick: async () => await destroy(server),
            },
        ];
    }

    async function handleRename() {
        if (renamingServer && newName && newName !== renamingServer.name) {
            await renamingServer.rename(newName);
        }
        isRenaming = false;
        renamingServer = null;
    }

    async function destroy(server: McpServer) {
        await server.delete();
        goto(`/mcp-servers`);
    }
</script>

{#snippet titlebar()}
    <Titlebar class="h-[60px] w-full">
        <Flex
            class=" border-r-light h-full w-[300px] items-center justify-between border-r px-8 pr-4"
        >
            <h1 class="font-[500]">MCP Servers</h1>
            <a
                href="/mcp-servers/new"
                class="border-light h-8 w-8 rounded-md border hover:cursor-pointer"
            >
                <p class="h-8 w-8 text-center !leading-[22px] font-[10px]">+</p>
            </a>
        </Flex>
    </Titlebar>
{/snippet}

{#snippet McpServerView(server: McpServer)}
    <Menu items={items(server)}>
        {#if isRenaming && renamingServer?.id === server.id}
            <form
                class="w-full py-3 pl-8"
                onsubmit={e => {
                    e.preventDefault();
                    handleRename();
                }}
            >
                <!-- svelte-ignore a11y_autofocus -->
                <input
                    type="text"
                    bind:value={newName}
                    class="w-full bg-transparent text-sm outline-none"
                    onblur={handleRename}
                    onkeydown={e => e.stopPropagation()}
                    autofocus
                />
            </form>
        {:else}
            <Link
                href={`/mcp-servers/${server.id}`}
                class="w-full py-3 pl-8 text-sm hover:cursor-pointer"
                activeClass="text-purple border-l border-l-purple"
            >
                {server.name}
            </Link>
        {/if}
    </Menu>
{/snippet}

{#snippet RegistryView(registry: Registry)}
    <Link
        href={`/mcp-servers/${registry.name.toLowerCase()}`}
        class="mb-4 flex h-full w-full items-center pl-8"
        activeClass="text-purple"
    >
        <Svg name={registry.icon} class="mr-4 h-6 w-6" />
        {registry.name}
    </Link>
{/snippet}

<Layout {titlebar}>
    <Flex class="h-full items-start">
        <Flex class="border-r-light h-full w-[300px] flex-col items-start border-r">
            <List items={mcpServers} itemView={McpServerView} />
            <List
                items={registries}
                itemView={RegistryView}
                borderless
                title="Registries"
                class="mt-4"
                titleClass="pl-8 my-4"
            />
        </Flex>

        <Flex class="h-full w-[calc(100%-300px)] items-start p-8">
            <Scrollable>
                {@render children?.()}
            </Scrollable>
        </Flex>
    </Flex>
</Layout>
