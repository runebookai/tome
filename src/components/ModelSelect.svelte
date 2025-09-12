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

    // svelte-ignore non_reactive_update
    let ref: HTMLDivElement;

    let w = $state(0);
    let x = $state(0);
    let y = $state(0);

    function open() {
        const rect = ref.getBoundingClientRect();
        w = rect.width;
        x = rect.x;
        y = rect.y + rect.height;
        isOpen = true;
    }

    function close() {
        isOpen = false;
    }

    function toggle(e: Event) {
        e.stopPropagation();

        if (isOpen) {
            close();
        } else {
            open();
        }
    }

    function icon(engine: Engine) {
        return capitalCase(engine.type == 'openai-compat' ? 'openai' : engine.type);
    }

    async function select(e: Event, model: Model) {
        e.preventDefault();
        e.stopPropagation();
        selected = model;
        await onselect?.(model);
        close();
    }

    onMount(() => {
        closables.register(ref as Node, close);
    });
</script>

<Flex class="w-full">
    <Flex
        bind:ref
        onclick={toggle}
        class={twMerge(
            `border-light h-16 w-full rounded-md border text-sm
            hover:cursor-pointer ${isOpen ? 'rounded-b-none border-b-0' : ''}`,
            cls?.toString()
        )}
    >
        <Flex class="px-4">
            <Svg name={icon(selected.engine)} class="mr-2 h-4 w-4" />
            <p>{selected.name}</p>
        </Flex>

        <Svg name="Arrows" class="text-medium mr-3 ml-auto h-3 w-4" />
    </Flex>

    {#if isOpen}
        <Flex
            style="position: fixed; left: {x}px; top: {y}px; width: {w}px;"
            class="bg-medium noscrollbar border-light absolute
            z-50 h-96 max-h-96 flex-col items-start 
            overflow-y-auto rounded-md rounded-t-none
            border border-t-0 text-sm"
        >
            {#each engines as engine (engine.id)}
                {#if engine.models.length}
                    <Flex
                        class="text-medium border-light w-full border-t
                        px-4 py-2 pt-4 text-xs font-medium uppercase"
                    >
                        <Svg name={icon(engine)} class="mr-2 h-4 w-4" />
                        <p>{engine.name}</p>
                    </Flex>

                    <Flex class="w-full flex-col items-start">
                        {#each engine.models as model (model.id)}
                            <button
                                onclick={async e => await select(e, model)}
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
