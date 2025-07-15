<script lang="ts">
    import { goto } from '$app/navigation';

    import Deleteable from '$components/Deleteable.svelte';
    import Flex from '$components/Flex.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Link from '$components/Link.svelte';
    import List from '$components/List.svelte';
    import type { MenuItem } from '$components/Menu.svelte';
    import Menu from '$components/Menu.svelte';
    import Scrollable from '$components/Scrollable.svelte';
    import Titlebar from '$components/Titlebar.svelte';
    import Task from '$lib/models/task.svelte';

    const { children } = $props();
    const tasks: Task[] = $derived(Task.all());

    function items(task: Task): MenuItem[] {
        return [
            {
                label: 'Run',
                onclick: async () => await run(task),
            },
            {
                label: 'Edit',
                onclick: async () => await edit(task),
            },
            {
                label: 'Delete',
                style: 'text-red hover:bg-red hover:text-white',
                onclick: async () => await destroy(task),
            },
        ];
    }

    async function destroy(task: Task) {
        await task.delete();
        await goto(`/tasks`);
    }

    async function edit(task: Task) {
        await goto(`/tasks/${task.id}/edit`);
    }

    async function run(task: Task) {
        const run = await task.app.execute();

        if (run) {
            await goto(`/tasks/${task.id}/runs/${run.id}`);
        }
    }
</script>

{#snippet titlebar()}
    <Titlebar class="h-[60px] w-full">
        <Flex
            class=" border-r-light h-full w-[300px] items-center justify-between border-r px-8 pr-4"
        >
            <h1 class="font-[500]">Tasks</h1>
            <a href="/apps/new" class="border-light h-8 w-8 rounded-md border hover:cursor-pointer">
                <p class="h-8 w-8 text-center !leading-[22px] font-[10px]">+</p>
            </a>
        </Flex>
    </Titlebar>
{/snippet}

{#snippet TaskView(task: Task)}
    <Menu items={items(task)}>
        <Deleteable ondelete={() => destroy(task)}>
            <Link
                href={`/apps/${task.id}`}
                class="w-full py-3 pl-8 text-sm hover:cursor-pointer"
                activeClass="text-purple border-l border-l-purple"
            >
                {task.app.name}
            </Link>
        </Deleteable>
    </Menu>
{/snippet}

<Layout {titlebar}>
    <Flex class="h-full items-start">
        <Flex class="border-r-light h-full w-[300px] flex-col items-start border-r">
            <List items={tasks} itemView={TaskView} />
        </Flex>

        <Flex class="h-full w-[calc(100%-300px)] items-start">
            <Scrollable>
                {@render children?.()}
            </Scrollable>
        </Flex>
    </Flex>
</Layout>
