<script lang="ts">
    import { onMount } from 'svelte';
    import type { SvelteHTMLElements } from 'svelte/elements';

    import Scrollable from './Scrollable.svelte';

    import Flex from '$components/Flex.svelte';
    import closables from '$lib/closables';

    interface Option {
        label: string;
        value: string;
    }

    interface Props {
        options: Option[];
        value: string;
        onselect?: (value: string) => unknown;
        class?: SvelteHTMLElements['div']['class'];
    }

    let {
        options,
        value = $bindable(options[0].value),
        onselect,
        class: cls = '',
    }: Props = $props();

    let ref: ReturnType<typeof Flex>;
    let isOpen: boolean = $state(false);

    function selected() {
        return options.find(o => o.value == value) || options[0];
    }

    function close() {
        isOpen = false;
    }

    function toggle(e: Event) {
        e.stopPropagation();
        isOpen = isOpen ? false : true;
    }

    function select(val: string) {
        value = val;
        onselect?.(val);
    }

    onMount(() => {
        closables.register(ref as Node, close);
    });
</script>

<Flex bind:this={ref} class={`relative h-full min-w-72 ${cls?.toString()}`}>
    <Flex
        class={`border-xlight z-50 h-full w-full justify-between rounded-md 
        border px-4 text-sm hover:cursor-pointer ${isOpen ? 'rounded-b-none' : ''}`}
        onclick={toggle}
    >
        <p>{selected().label}</p>
        <p>⏷</p>
    </Flex>

    {#if isOpen}
        <Flex
            class={`border-xlight bg-dark absolute top-[100%] left-0 w-full flex-col items-start
            rounded-md border ${isOpen ? 'rounded-t-none border-t-0' : ''}`}
        >
            <Scrollable class="noscrollbar !h-72">
                {#each options as option (option.value)}
                    <button
                        onclick={() => select(option.value)}
                        class="border-b-xlight hover:bg-light w-full border-b px-4 py-3
                    text-left text-sm last:border-b-0 hover:cursor-pointer"
                    >
                        {option.label}
                    </button>
                {/each}
            </Scrollable>
        </Flex>
    {/if}
</Flex>
