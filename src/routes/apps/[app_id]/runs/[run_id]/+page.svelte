<script lang="ts">
    import { onMount } from 'svelte';
    import { afterNavigate, goto } from '$app/navigation';
    import { page } from '$app/state';

    import Flex from '$components/Flex.svelte';
    import Link from '$components/Link.svelte';
    import List from '$components/List.svelte';
    import Menu from '$components/Menu.svelte';
    import Message from '$components/Message.svelte';
    import Spinner from '$components/Spinner.svelte';
    import Svg from '$components/Svg.svelte';
    import { AppRun } from '$lib/models';
    import App from '$lib/models/app.svelte';
    import { State } from '$lib/models/app-run.svelte';

    const app: App = $derived(App.find(Number(page.params.app_id)));
    const run: AppRun = $derived(AppRun.find(Number(page.params.run_id)));

    // svelte-ignore non_reactive_update
    let content: HTMLDivElement;

    function scrollToBottom(_: HTMLDivElement) {
        if (content) {
            content.scroll({ top: 9e15 });
        }
    }

    async function cancel(run: AppRun) {
        await run.fail('Cancelled');
        goto(`/apps/${app.id}`);
    }

    function menuItems(run: AppRun) {
        if (run.isPending()) {
            return [
                {
                    label: 'Cancel',
                    style: 'text-red hover:bg-red hover:text-white',
                    onclick: async () => await cancel(run),
                },
            ];
        } else {
            return [];
        }
    }

    afterNavigate(() => {
        scrollToBottom(content);
    });

    onMount(() => {
        scrollToBottom(content);
    });
</script>

{#snippet RunListItem(run: AppRun)}
    <Menu items={menuItems(run)}>
        <Flex class="w-full pr-8">
            <Link
                href={`/apps/${app.id}/runs/${run.id}`}
                class="text-medium flex grow flex-row items-center px-7 py-2"
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

            <p class="text-medium text-xs">{run.stateReason}</p>
        </Flex>
    </Menu>
{/snippet}

{#key page.params.app_id}
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
            <List items={app?.runs} itemView={RunListItem} class="border-t-light border-t" />
        </Flex>
    </Flex>
{/key}
