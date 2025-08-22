<script lang="ts">
    import { goto } from '$app/navigation';

    import Flex from '$components/Flex.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Link from '$components/Link.svelte';
    import List from '$components/List.svelte';
    import type { MenuItem } from '$components/Menu.svelte';
    import Menu from '$components/Menu.svelte';
    import Scrollable from '$components/Scrollable.svelte';
    import Titlebar from '$components/Titlebar.svelte';
    import Relay from '$lib/models/relay.svelte';

    const { children } = $props();
    const relays: Relay[] = $derived(Relay.all());

    function items(relay: Relay): MenuItem[] {
        return [
            {
                label: 'Edit',
                onclick: async () => await edit(relay),
            },
            {
                label: 'Delete',
                style: 'text-red hover:bg-red hover:text-white',
                onclick: async () => await destroy(relay),
            },
        ];
    }

    async function destroy(relay: Relay) {
        await relay.delete();
        await goto(`/relays`);
    }

    async function edit(relay: Relay) {
        await goto(`/relays/${relay.id}/edit`);
    }
</script>

{#snippet titlebar()}
    <Titlebar class="h-[60px] w-full">
        <Flex
            class=" border-r-light h-full w-[300px] items-center justify-between border-r px-8 pr-4"
        >
            <h1 class="font-[500]">Relays</h1>
            <a
                href="/relays/new"
                class="border-light h-8 w-8 rounded-md border hover:cursor-pointer"
            >
                <p class="h-8 w-8 text-center !leading-[22px] font-[10px]">+</p>
            </a>
        </Flex>
    </Titlebar>
{/snippet}

{#snippet RelayView(relay: Relay)}
    <Menu items={items(relay)}>
        <Link
            href={`/relays/${relay.id}`}
            class="w-full py-3 pl-8 text-sm hover:cursor-pointer"
            activeClass="text-purple border-l border-l-purple"
        >
            {relay.name}
        </Link>
    </Menu>
{/snippet}

<Layout {titlebar}>
    <Flex class="h-full items-start">
        <Flex class="border-r-light h-full w-[300px] flex-col items-start border-r">
            <List items={relays} itemView={RelayView} />
        </Flex>

        <Flex class="h-full w-[calc(100%-300px)] items-start">
            <Scrollable>
                {@render children?.()}
            </Scrollable>
        </Flex>
    </Flex>
</Layout>
