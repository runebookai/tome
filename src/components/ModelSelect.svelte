<script lang="ts">
    import { capitalCase } from 'change-case';
    import { onMount } from 'svelte';
    import type { SvelteHTMLElements } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Svg from './Svg.svelte';

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

    function close() {
        isOpen = false;
    }

    function toggle(e: Event) {
        e.stopPropagation();
        isOpen = isOpen ? false : true;
    }

    function icon(engine: Engine) {
        return capitalCase(engine.type);
    }

    async function select(model: Model) {
        selected = model;
        await onselect?.(model);
        close();
    }

    onMount(() => {
        closables.register(ref as Node, close);
    });
</script>

<Flex class="relative">
    <Flex
        bind:this={ref}
        onclick={toggle}
        class={twMerge(
            `bg-medium border-light h-16 justify-between rounded-md
            border text-sm hover:cursor-pointer`,
            cls?.toString()
        )}
    >
        <Flex class="px-6">
            <Svg name={icon(selected.engine)} class="mr-2 h-4 w-4" />
            <p>{selected.name}</p>
        </Flex>

        <Svg name="Arrows" class="text-medium mr-3 h-3 w-4" />
    </Flex>

    {#if isOpen}
        <Flex
            class="bg-medium border-light noscrollbar absolute top-full z-50
            max-h-96 w-full flex-col items-start overflow-y-auto rounded-b-md
            border border-t-0 text-sm"
        >
            {#each engines as engine (engine.id)}
                {#if engine.models.length}
                    <Flex
                        class="text-medium border-light w-full border-t
                        px-6 py-2 pt-4 text-xs font-medium uppercase"
                    >
                        <Svg name={icon(engine)} class="mr-2 h-4 w-4" />
                        <p>{engine.name}</p>
                    </Flex>

                    <Flex class="w-full flex-col items-start">
                        {#each engine.models as model (model.id)}
                            <button
                                onclick={async () => await select(model)}
                                class="hover:bg-light text-light-lite hover:text-light
                            mx-2 w-[calc(100%-14px)] rounded-sm p-2 px-4
                            text-left last:mb-2 hover:cursor-pointer"
                            >
                                {model.name}
                            </button>
                        {/each}
                    </Flex>
                {/if}
            {/each}
        </Flex>
    {/if}
</Flex>
