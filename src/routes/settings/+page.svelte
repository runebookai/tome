<script lang="ts">
    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Scrollable from '$components/Scrollable.svelte';
    import CustomPromptView from '$components/Settings/CustomPrompt.svelte';
    import EngineView from '$components/Settings/Engine.svelte';
    import Svg from '$components/Svg.svelte';
    import Titlebar from '$components/Titlebar.svelte';
    import * as color from '$lib/colorscheme';
    import Engine from '$lib/models/engine.svelte';
    import Setting from '$lib/models/setting.svelte';
    import { openPath } from '@tauri-apps/plugin-opener';
    import { appLogDir } from '@tauri-apps/api/path';

    const engines: Engine[] = $derived(Engine.all());

    let adding = $state(false);
    let saving = $state(false);
    let scheme: color.ColorScheme = $state(Setting.ColorScheme ?? 'system');

    // Color scheme state

    function onColorSchemeChange() {
        Setting.ColorScheme = scheme;
        color.apply(scheme);
    }

    async function ondelete(engine: Engine) {
        await engine.delete();
    }

    function onsave(_: Engine) {
        adding = false;
    }

    async function viewLogs() {
        var logDir = await appLogDir();
        logDir += "/Tome.log"
        await openPath(logDir);
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
    <Scrollable class="!h-content bg-medium">
        <Flex class="w-full flex-col gap-8 overflow-y-auto p-8">
            <Flex class="w-full items-start gap-4">
                <section class="w-2/5">
                  <h2 class="font-semibold uppercase">Color Scheme</h2>
                  <p class="text-medium font-light">Set the color scheme of Tome</p>
                </section>

                <Flex class="w-full items-center gap-4">
                  <select
                    class="border-light bg-medium text-light mt-2 rounded-md border p-2"
                    bind:value={scheme}
                    onchange={onColorSchemeChange}
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>

                  <section class="ml-auto">
                    <Button
                      onclick={viewLogs}
                      class="ml-auto border-purple text-purple mt-2"
                    >
                      View Logs
                    </Button>
                  </section>
                </Flex>
              </Flex>

            <Flex class="w-full items-start gap-4">
                <section class="w-2/5">
                    <h2 class="font-semibold uppercase">Custom Prompt</h2>
                    <p class="text-medium font-light">
                        Set a custom system prompt that will be used for all new conversations
                        instead of the default prompt.
                    </p>
                </section>

                <Flex class="w-full flex-col items-start">
                    <CustomPromptView bind:saving />
                </Flex>
            </Flex>

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
