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
    import App from '$lib/models/app.svelte';

    const { children } = $props();
    const apps: App[] = $derived(App.nonReserved());

    function items(app: App): MenuItem[] {
        return [
            {
                label: 'Run',
                onclick: async () => await run(app),
            },
            {
                separator: true,
            },
            {
                label: 'Edit',
                onclick: async () => await edit(app),
            },
            {
                label: 'Export',
                onclick: async () => await _export(app),
            },
            {
                separator: true,
            },
            {
                label: 'Delete',
                style: 'text-red hover:bg-red hover:text-white',
                onclick: async () => await destroy(app),
            },
        ];
    }

    async function destroy(app: App) {
        await app.delete();
        await goto(`/apps`);
    }

    async function edit(app: App) {
        await goto(`/apps/${app.id}/edit`);
    }

    async function _export(app: App) {
        await goto(`/apps/${app.id}/export`);
    }

    async function run(app: App) {
        const run = await app.execute();

        if (run) {
            await goto(`/apps/${app.id}/runs/${run.id}`);
        }
    }
</script>

{#snippet titlebar()}
    <Titlebar class="h-[60px] w-full">
        <Flex
            class=" border-r-light h-full w-[300px] items-center justify-between border-r px-8 pr-4"
        >
            <h1 class="font-[500]">Apps</h1>
            <a href="/apps/new" class="border-light h-8 w-8 rounded-md border hover:cursor-pointer">
                <p class="h-8 w-8 text-center !leading-[22px] font-[10px]">+</p>
            </a>
        </Flex>
    </Titlebar>
{/snippet}

{#snippet AppView(app: App)}
    <Menu items={items(app)}>
        <Link
            href={`/apps/${app.id}`}
            class="w-full py-3 pl-8 text-sm hover:cursor-pointer"
            activeClass="text-purple border-l border-l-purple"
        >
            {app.name}
        </Link>
    </Menu>
{/snippet}

<Layout {titlebar}>
    <Flex class="h-full items-start">
        <Flex class="border-r-light h-full w-[300px] flex-col items-start border-r">
            <List items={apps} itemView={AppView} />
        </Flex>

        <Flex class="h-full w-[calc(100%-300px)] items-start">
            <Scrollable>
                {@render children?.()}
            </Scrollable>
        </Flex>
    </Flex>
</Layout>
