<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { goto } from '$app/navigation';

    import Finished from '$components/App/Transfer/Import/Finished.svelte';
    import Info from '$components/App/Transfer/Import/Info.svelte';
    import Mcp from '$components/App/Transfer/Import/Mcp.svelte';
    import Modal from '$components/App/Transfer/Modal.svelte';
    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
    import Svg from '$components/Svg.svelte';
    import { install, type SerializedApp, type SerializedMcpServer } from '$lib/apps';
    import { App } from '$lib/models';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        serializedApp: SerializedApp;
    }

    const { serializedApp }: Props = $props();

    let screen: 'info' | 'mcp' | 'complete' = $state('info');
    let label = $state('Continue');
    let app: App;

    /**
     * List of MCP servers from the App that need to be verified.
     *
     * When they are fully configured and successfully can start and return
     * metadata, they are removed from this list.
     *
     * When all servers are removed from this list, we know they will
     * successfully be installed.
     */
    let mcpServersToVerify = $state(serializedApp.mcp_servers.mapBy('name'));

    async function transition(e: Event) {
        e.stopPropagation();

        if (screen == 'info') {
            toMcp();
        } else if (screen == 'mcp') {
            app = await install(serializedApp);
            toComplete();
        } else if (screen == 'complete') {
            await goto(`/apps/${app.id}`);
        }
    }

    function toMcp() {
        screen = 'mcp';
        label = 'Import';
    }

    function toComplete() {
        screen = 'complete';
        label = 'Close';
    }

    async function verifyMcpServer(server: SerializedMcpServer) {
        mcpServersToVerify.remove(server.name);
    }

    async function close() {
        history.back();
    }
</script>

<Modal {close} class="border-light flex flex-col border p-0">
    <Flex class="bg-medium border-light w-full flex-0 rounded-t-md border-b p-3 pl-6">
        <p class="grow text-sm">Import</p>

        <button onclick={close} class="border-light text-medium rounded-sm border p-2">
            <Svg name="X" class="h-2 w-2" />
        </button>
    </Flex>

    <Flex class="bg-dark min-h-0 w-full flex-1 flex-col items-start overflow-y-auto">
        {#if screen == 'info'}
            <Info app={serializedApp} />
        {:else if screen == 'mcp'}
            <div class="w-full p-4">
                {#each serializedApp.mcp_servers as server (server.name)}
                    <Mcp {server} onvalid={verifyMcpServer} />
                {/each}
            </div>
        {:else}
            <Finished app={serializedApp} />
        {/if}
    </Flex>

    <Flex class="bg-dark w-full flex-0 justify-center p-4">
        <Button
            onclick={transition}
            disabled={screen == 'mcp' && !mcpServersToVerify.isEmpty()}
            class="bg-purple text-dark w-full border-none text-xs font-semibold
            uppercase disabled:opacity-25"
        >
            {label}
        </Button>
    </Flex>
</Modal>
