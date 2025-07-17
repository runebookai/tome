<script lang="ts">
    import { onMount } from 'svelte';
    import type { SvelteHTMLElements } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';
    import Group from '$components/Select/Group.svelte';
    import type { Option, OptionGroup } from '$components/Select/types';
    import Svg from '$components/Svg.svelte';
    import closables from '$lib/closables';

    interface Props {
        options: OptionGroup[] | Option[];
        value: string;
        grouped?: boolean;
        onselect?: (option: Option) => unknown;
        class?: SvelteHTMLElements['div']['class'];
    }

    let {
        options,
        grouped = false,
        value = $bindable(),
        onselect,
        class: cls = '',
    }: Props = $props();

    let selected = $derived.by(() => {
        return grouped
            ? (options as OptionGroup[])
                  .mapBy('options')
                  .flat()
                  .find(o => o.value == value)
            : (options as Option[]).find(o => o.value == value);
    });

    let ref: ReturnType<typeof Flex>;
    let isOpen: boolean = $state(false);

    function close() {
        isOpen = false;
    }

    function toggle(e: Event) {
        e.stopPropagation();
        isOpen = isOpen ? false : true;
    }

    function select(option: Option) {
        value = option.value;
        onselect?.(option);
    }

    onMount(() => {
        closables.register(ref as Node, close);
    });
</script>

<Flex class="relative w-full">
    <Flex
        bind:this={ref}
        onclick={toggle}
        class={twMerge(
            'border-light h-12 w-full rounded-md border text-sm',
            `hover:cursor-pointer ${isOpen ? 'rounded-b-none border-b-0' : ''}`,
            cls?.toString()
        )}
    >
        {#if selected}
            <Flex class="px-4">
                {#if selected.icon}
                    <Svg name={selected.icon} class="mr-2 h-4 w-4" />
                {/if}
                <p>{selected.label}</p>
            </Flex>
        {/if}

        <Svg name="Arrows" class="text-medium mr-3 ml-auto h-3 w-4" />
    </Flex>

    {#if isOpen}
        {#if grouped}
            {#each options as group (group.label)}
                <Group onselect={select} group={group as OptionGroup} />
            {/each}
        {:else}
            <Group onselect={select} group={{ options: options as Option[] }} />
        {/if}
    {/if}
</Flex>
