<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';

    interface Row {
        cols: Col[];
    }

    interface Col {
        view?: Snippet;
        value?: unknown;
        editable?: boolean;
        placeholder?: string;
    }

    interface Props extends HTMLAttributes<HTMLTableElement> {
        rows: Row[];
        rowClass?: string;
        colClass?: string;
        inputClass?: string;
    }

    const { rows, class: cls, rowClass, colClass, inputClass }: Props = $props();
</script>

<Flex class={twMerge('text-light w-full flex-col items-start', cls?.toString())}>
    {#each rows as row, i (`row-${i}`)}
        <Flex class={twMerge('w-full overflow-x-scroll', rowClass?.toString())}>
            {#each row.cols as col, i (`col-${i}`)}
                {#if col.editable === true}
                    <input
                        class={twMerge(
                            'border-light h-auto w-full flex-1 rounded-sm border p-0 px-2',
                            inputClass?.toString()
                        )}
                        placeholder={col.placeholder}
                    />
                {:else}
                    <div
                        class={twMerge(
                            'flex-1 overflow-x-scroll whitespace-nowrap',
                            colClass?.toString()
                        )}
                    >
                        {#if col.view}
                            {@render col.view()}
                        {:else}
                            <p>{col.value}</p>
                        {/if}
                    </div>
                {/if}
            {/each}
        </Flex>
    {/each}
</Flex>
