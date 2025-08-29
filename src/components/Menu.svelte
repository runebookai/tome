<script lang="ts" module>
    interface Separator {
        separator: boolean;
        icon?: undefined;
        label?: undefined;
        style?: undefined;
        onclick?: undefined;
    }

    interface Action {
        separator?: undefined;
        icon?: string;
        label: string;
        style?: string;
        onclick: () => void;
    }

    export type MenuItem = Separator | Action;
</script>

<script lang="ts">
    import { onMount } from 'svelte';
    import type { SvelteHTMLElements } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';
    import Svg from '$components/Svg.svelte';
    import closables from '$lib/closables';

    type Props = SvelteHTMLElements['div'] & {
        items: MenuItem[];
    };

    const { items, children }: Props = $props();

    let isOpen = $state(false);

    // svelte-ignore non_reactive_update
    let outer: HTMLButtonElement;
    // svelte-ignore non_reactive_update
    let inner: HTMLDivElement;

    function toggle(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        closables.closeAll();
        inner.style.left = `${e.clientX}px`;
        inner.style.top = `${e.clientY}px`;
        isOpen = isOpen ? false : true;
    }

    function onclick(item: Action) {
        item.onclick();
        isOpen = false;
    }

    function close() {
        isOpen = false;
    }

    onMount(() => {
        closables.register(outer, close);
    });
</script>

{#if items.length}
    <button
        bind:this={outer}
        onclick={close}
        oncontextmenu={toggle}
        class="h-full w-full text-left"
    >
        {@render children?.()}

        <Flex
            bind:ref={inner}
            class={`${isOpen ? 'fixed' : 'hidden'} bg-light border-light z-20 min-w-56 
        flex-col rounded-lg border py-2 text-base shadow-md shadow-black/10 group-hover:block`}
        >
            {#each items as item, i (i)}
                {#if item.separator}
                    <div class="bg-xlight my-1 h-[1px] w-full"></div>
                {:else}
                    <button
                        onclick={() => onclick(item as Action)}
                        class={twMerge(
                            'hover:bg-purple flex w-full flex-row items-center p-8 py-1.5 hover:cursor-pointer',
                            item.style
                        )}
                    >
                        {#if item.icon}
                            <div class="mr-4 h-4 w-4">
                                <Svg name={item.icon} />
                            </div>
                        {/if}

                        <p>{item.label}</p>
                    </button>
                {/if}
            {/each}
        </Flex>
    </button>
{:else}
    {@render children?.()}
{/if}
