<script lang="ts">
    import { page } from '$app/state';

    import Flex from '$components/Flex.svelte';
    import Link from '$components/Link.svelte';
    import List from '$components/List.svelte';
    import Message from '$components/Message.svelte';
    import Svg from '$components/Svg.svelte';
    import { TaskRun } from '$lib/models';
    import Task from '$lib/models/task.svelte';

    const task: Task = $derived(Task.find(Number(page.params.task_id)));
    const run: TaskRun = $derived(TaskRun.find(Number(page.params.run_id)));
</script>

{#snippet RunView(run: TaskRun)}
    <Link
        href={`/tasks/${task.id}/runs/${run.id}`}
        class="text-medium flex flex-row items-center px-7 py-2"
        activeClass="text-purple border-l border-l-purple"
    >
        {#if run.success}
            <Svg name="Check" class="text-green h-4 w-4" />
        {:else}
            <Svg name="Warning" class="text-red h-4 w-4" />
        {/if}

        <p class="ml-4">{run.timestamp?.format('LLLL')}</p>
    </Link>
{/snippet}

{#key page.params.task_id}
    <Flex class="h-full w-full flex-col items-start">
        <Flex class="h-3/5 w-full flex-col items-start overflow-y-scroll p-8">
            {#if run}
                {#each run.session.messages as message (message.id)}
                    <Message {message} />
                {/each}
            {/if}
        </Flex>

        <Flex class="border-t-light h-2/5 w-full flex-col items-start border-t py-4">
            <h3 class="mb-4 ml-8 uppercase">History</h3>
            <List items={task.runs} itemView={RunView} class="border-t-light border-t" />
        </Flex>
    </Flex>
{/key}
