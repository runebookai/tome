<script lang="ts">
    import { onMount } from 'svelte';
    import { twMerge } from 'tailwind-merge';

    import Box from '$components/Box.svelte';
    import Flex from '$components/Flex.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Svg from '$components/Svg.svelte';
    import { Config, Engine, type IModel } from '$lib/models';

    const engines: Engine[] = Engine.all();

    function isDefault(model: IModel) {
        return Config.defaultModel == model.id;
    }

    function setDefault(model: IModel) {
        Config.defaultModel = model.id;
    }

    onMount(async () => {
        await Engine.sync();
    });
</script>

{#snippet titlebar()}
    <Flex class=" h-full w-[300px] items-center px-8 pr-4">
        <h1 class="font-[500]">Models</h1>
    </Flex>
{/snippet}

{#snippet label(text: string, css: string)}
    <p
        class={twMerge(
            css,
            'mx-1 rounded-xs px-1 py-0 text-[9px] leading-[16px] font-semibold text-[#000] uppercase'
        )}
    >
        {text}
    </p>
{/snippet}

<Layout {titlebar}>
    <div class="h-full w-full overflow-y-auto">
        <Flex class="w-full flex-col items-start gap-2 p-8">
            {#each engines as engine (engine.id)}
                <div class="mb-16 w-full">
                    <h2 class="mb-4 ml-6 text-2xl">{engine.name}</h2>
                    <Flex class="grid w-full grid-cols-3 gap-6 gap-y-4">
                        {#each engine.models as model (model.id)}
                            <Box class="border-light group mb-2 flex-row items-center border pl-6">
                                <h3 class="text-light">{model.name}</h3>

                                <button
                                    onclick={() => setDefault(model)}
                                    class={`ml-2 h-4 w-4 group-hover:block hover:cursor-pointer
                                ${isDefault(model) ? 'fill-yellow' : 'stroke-yellow hidden'}`}
                                >
                                    <Svg name="Star" title="Default Model" />
                                </button>

                                <Flex class="grow justify-end">
                                    {#if model.metadata?.details}
                                        {@render label(
                                            model.metadata.details.format,
                                            'bg-[#7aa2f7]'
                                        )}
                                        {@render label(
                                            model.metadata.details.parameter_size,
                                            'bg-[#ff9e64]'
                                        )}
                                        {@render label(
                                            model.metadata.details.quantization_level,
                                            'bg-[#41a6b5]'
                                        )}
                                    {/if}
                                </Flex>
                            </Box>
                        {/each}
                    </Flex>
                </div>
            {/each}
        </Flex>
    </div>
</Layout>
