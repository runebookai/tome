<script lang="ts">
    import { onMount } from 'svelte';
    import type { SvelteHTMLElements } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';
    import closables from '$lib/closables';
    import { Engine, Model } from '$lib/models';

    interface Props {
        engines?: Engine[];
        selected?: Model;
        onselect?: (model: Model) => Promise<void>;
        class?: SvelteHTMLElements['div']['class'];
    }

    let {
        engines = Engine.all(),
        onselect,
        selected = Model.default(),
        class: cls = '',
    }: Props = $props();
    let isOpen = $state(false);
    let ref: ReturnType<typeof Flex>;

    async function select(m: Model) {
        close();
        await onselect?.(m);
    }

    function toggle(e: Event) {
        e.stopPropagation();
        isOpen = isOpen ? false : true;
    }

    function close() {
        isOpen = false;
    }

    onMount(() => {
        closables.register(ref as Node, close);
    });
</script>

<Flex
    bind:this={ref}
    class={twMerge('bg-medium relative h-16 w-full hover:cursor-pointer', cls?.toString())}
>
    <Flex
        onclick={e => toggle(e)}
        class="border-light absolute top-0 left-0 w-full justify-between
        rounded-md border p-2 px-4"
    >
        <p>{selected?.name}</p>
        <p>⏷</p>
    </Flex>

    {#if isOpen}
        <Flex
            class="border-light bg-medium absolute top-12 left-0 z-50 -mt-[1px]
            max-h-[calc(100vh*0.7)] w-full flex-col items-start overflow-y-auto rounded-md
            rounded-t-none border"
        >
            {#each engines as engine (engine.id)}
                {#if engine.models.length}
                    <p class="text-medium px-4 pt-2 pb-2 text-sm font-[500] uppercase">
                        {engine.name}
                    </p>

                    <div>
                        {#each engine.models as model (model.id)}
                            <button
                                onclick={async () => await select(model)}
                                class="border-light w-full border-b p-2 px-4 pl-8 text-left
                            first:border-t last:border-b-0 hover:cursor-pointer"
                            >
                                {model.name}
                            </button>
                        {/each}
                    </div>
                {/if}
            {/each}
        </Flex>
    {/if}
</Flex>
