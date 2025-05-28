<script lang="ts">
    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Scrollable from '$components/Scrollable.svelte';
    import EngineView from '$components/Settings/Engine.svelte';
    import Svg from '$components/Svg.svelte';
    import Titlebar from '$components/Titlebar.svelte';
    import Engine, { type IEngine } from '$lib/models/engine';

    const engines: IEngine[] = $derived(Engine.all());

    let adding = $state(false);
    let saving = $state(false);

    async function ondelete(engine: IEngine) {
        await Engine.delete(engine.id);
    }

    function onsave(_: IEngine) {
        adding = false;
    }
</script>

{#snippet titlebar()}
    <Titlebar class="h-[60px] w-full">
        <Flex class="h-full px-8 pr-4">
            <h1 class="font-[500]">Settings</h1>
            <div class={`text-green mt-[2px] ml-4 h-4 w-4 ${saving ? 'opacity-100' : 'opacity-0'}`}>
                <Svg name="Check" />
            </div>
        </Flex>
    </Titlebar>
{/snippet}

<Layout {titlebar}>
    <Scrollable class="!h-content">
        <Flex class="w-full flex-col gap-4 overflow-y-auto p-8">
            <Flex class="w-full items-start gap-4">
                <section class="w-2/5">
                    <h2 class="font-semibold uppercase">Engines</h2>
                    <p class="text-medium font-light">
                        Backends that provide access to LLMs. Any OpenAI API compatible engine is
                        supported.
                    </p>
                    <Button onclick={() => (adding = true)} class="border-purple text-purple mt-4">
                        Add Engine
                    </Button>
                </section>

                <Flex class="w-full flex-col items-start gap-2">
                    {#if adding}
                        <EngineView
                            ondelete={() => (adding = false)}
                            {onsave}
                            bind:saving
                            explicitSave
                        />
                    {/if}

                    {#each engines as engine, i (engine.id)}
                        <EngineView bind:saving bind:engine={engines[i]} {ondelete} />
                    {/each}
                </Flex>
            </Flex>
        </Flex>
    </Scrollable>
</Layout>
