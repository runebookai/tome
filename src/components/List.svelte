<script lang="ts" generics="Item">
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Flex from './Flex.svelte';
    import Input from './Input.svelte';
    import Svg from './Svg.svelte';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        items: Item[];
        itemView: Snippet<[Item]>;
        borderless?: boolean;
        title?: string;
        titleClass?: string;
        filterable?: boolean;
        filterProp?: keyof Item;
    }

    const {
        items,
        itemView,
        class: cls = '',
        titleClass = '',
        borderless = false,
        title,
        filterable = false,
        filterProp,
    }: Props = $props();

    let filterTerm = $state('');
    let css = borderless ? '' : 'border-b-light border-b';

    function filter() {
        if (filterable && filterProp) {
            return items.filter(item => (item[filterProp] as string).includes(filterTerm));
        } else {
            return items;
        }
    }
</script>

<Flex class={twMerge('w-full flex-col items-start', cls?.toString())}>
    {#if title}
        <p class={twMerge('text-medium text-sm', titleClass?.toString())}>
            {title}
        </p>
    {/if}

    {#if filterable}
        <Flex class="border-b-light w-full border-b px-4">
            <Svg name="Search" class="text-dark h-4 w-4" />
            <Input
                label={false}
                type="text"
                placeholder="Filter..."
                bind:value={filterTerm}
                onkeyup={filter}
                class="w-full border-0"
            />
        </Flex>
    {/if}

    {#each filter() as item, i (i)}
        <div class={twMerge('w-full', css)}>
            {@render itemView(item)}
        </div>
    {/each}
</Flex>
