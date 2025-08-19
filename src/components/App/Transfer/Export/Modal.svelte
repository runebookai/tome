<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { goto } from '$app/navigation';

    import Finished from '$components/App/Transfer/Export/Finished.svelte';
    import Mcp from '$components/App/Transfer/Export/Mcp.svelte';
    import Info from '$components/App/Transfer/Info.svelte';
    import Modal from '$components/App/Transfer/Modal.svelte';
    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
    import Svg from '$components/Svg.svelte';
    import { serialize } from '$lib/apps';
    import { App } from '$lib/models';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        app: App;
    }

    const { app }: Props = $props();
    const serializedApp = $state(serialize(app));

    let mode = $state('info');
    let label = $state('Continue');

    function next(e: Event) {
        e.stopPropagation();

        if (mode == 'info') {
            mode = 'mcp';
        } else if (mode == 'mcp') {
            mode = 'finished';
            label = 'Close';
        }
    }

    async function close() {
        await goto(`/apps/${app.id}`);
    }
</script>

<Modal {close} class="flex flex-col p-0">
    <Flex class="bg-medium border-light w-full flex-0 border-b p-3 pl-6">
        <p class="grow text-sm">Export</p>
        <button onclick={close} class="border-light text-medium rounded-sm border p-2">
            <Svg name="X" class="h-2 w-2" />
        </button>
    </Flex>

    <Flex class="min-h-0 flex-1 flex-col items-start overflow-y-auto">
        {#if mode == 'info'}
            <Info {app} />
        {:else if mode == 'mcp'}
            <Mcp servers={serializedApp.mcp_servers} />
        {:else}
            <Finished {app} {serializedApp} />
        {/if}
    </Flex>

    <Flex class="w-full flex-0 p-4">
        <Button
            onclick={next}
            class="bg-purple text-dark w-full border-none text-xs font-semibold uppercase"
        >
            {label}
        </Button>
    </Flex>
</Modal>
