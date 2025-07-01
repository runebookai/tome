<script lang="ts">
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/state';

    import Flex from '$components/Flex.svelte';
    import Link from '$components/Link.svelte';
    import List from '$components/List.svelte';
    import Message from '$components/Message.svelte';
    import Spinner from '$components/Spinner.svelte';
    import Svg from '$components/Svg.svelte';
    import { TaskRun } from '$lib/models';
    import Task from '$lib/models/task.svelte';
    import { State } from '$lib/models/task-run.svelte';

    const task: Task = $derived(Task.find(Number(page.params.task_id)));
    const run: TaskRun = $derived(TaskRun.find(Number(page.params.run_id)));

    // svelte-ignore non_reactive_update
    let content: HTMLDivElement;

    function scrollToBottom(_: HTMLDivElement) {
        if (content) {
            content.scroll({ top: 9e15 });
        }
    }

    afterNavigate(() => {
        scrollToBottom(content);
    });

    onMount(() => {
        scrollToBottom(content);
    });
</script>

{#snippet RunView(run: TaskRun)}
    <Link
        href={`/tasks/${task.id}/runs/${run.id}`}
        class="text-medium flex flex-row items-center px-7 py-2"
        activeClass="text-purple border-l border-l-purple"
    >
        {#if run.state == State.Pending}
            <Spinner class="h-4 w-4 before:border-[2px] before:border-white/30" />
        {:else if run.state == State.Success}
            <Svg name="Check" class="text-green h-4 w-4" />
        {:else}
            <Svg name="Error" class="text-red h-4 w-4" />
        {/if}

        <p class="ml-4">{run.created?.format('LLLL')} UTC</p>
    </Link>
{/snippet}

{#key page.params.task_id}
    <Flex class="h-full w-full flex-col items-start">
        <Flex
            bind:ref={content}
            class="h-3/5 w-full flex-col items-start overflow-y-scroll p-8
            shadow-[inset_0px_-55px_55px_-55px_var(--background-color-dark)]"
        >
            {#if run}
                {#each run.session.messages as message (message.id)}
                    <Message {message} />
                    <div use:scrollToBottom class="hidden"></div>
                {/each}
            {/if}
        </Flex>

        <Flex class="border-t-light h-2/5 w-full flex-col items-start border-t">
            <h3 class="bg-medium w-full py-2 pl-8 font-medium uppercase">History</h3>
            <List items={task?.runs} itemView={RunView} class="border-t-light border-t" />
        </Flex>
    </Flex>
{/key}
