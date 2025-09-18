<script lang="ts" generics="Item extends { key: string }">
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
        emptyMessage?: string;
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
        emptyMessage = 'Nothing yet.',
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

<Flex class={twMerge('w-full flex-col items-start overflow-y-auto', cls?.toString())}>
    {#if title}
        <p class={twMerge('text-medium text-sm', titleClass?.toString())}>
            {title}
        </p>
    {/if}

    {#if filterable}
        <Flex class="border-b-light w-full items-center border-b px-4">
            <Svg name="Search" class="text-dark h-4 w-4" />
            <Input
                label={false}
                type="text"
                placeholder="Filter..."
                bind:value={filterTerm}
                onkeyup={filter}
                class="h-10 w-full border-0 text-sm"
            />
        </Flex>
    {/if}

    {#if items.length > 0}
        {#each filter() as item (item.key)}
            <div class={twMerge('w-full', css?.toString())}>
                {@render itemView(item)}
            </div>
        {/each}
    {:else}
        <p class="text-medium p-8">{emptyMessage}</p>
    {/if}
</Flex>
