<script lang="ts">
    import { emit } from '@tauri-apps/api/event';
    import { appLogDir } from '@tauri-apps/api/path';
    import { openPath } from '@tauri-apps/plugin-opener';
    import { check } from '@tauri-apps/plugin-updater';
    import { goto } from '$app/navigation';

    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Scrollable from '$components/Scrollable.svelte';
    import CustomPromptView from '$components/Settings/CustomPrompt.svelte';
    import EngineView from '$components/Settings/Engine.svelte';
    import Svg from '$components/Svg.svelte';
    import Titlebar from '$components/Titlebar.svelte';
    import Toggle from '$components/Toggle.svelte';
    import * as color from '$lib/colorscheme';
    import Engine from '$lib/models/engine.svelte';
    import Setting from '$lib/models/setting.svelte';

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

    async function setLabsMode(value: boolean) {
        Setting.LabsMode = value;
    }

    function onsave(_: Engine) {
        adding = false;
    }

    async function installUpdate() {
        await goto('/update');
    }

    async function viewLogs() {
        var logDir = await appLogDir();
        logDir += '/Tome.log';
        await openPath(logDir);
    }

    async function smitheryInstall() {
        await emit(
            'mcp/install',
            '%7B%22name%22%3A%22Exa%20Search%22%2C%22type%22%3A%22stdio%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40smithery%2Fcli%40latest%22%2C%22run%22%2C%22exa%22%2C%22--key%22%2C%22a897c0b6-f044-4caa-aedb-39885d0d0362%22%2C%22--profile%22%2C%22western-fish-uL81Ye%22%5D%7D'
        );
    }

    async function importApp() {
        await emit(
            'apps/import',
            'app=%7B%22name%22%3A%22hourly%20magic%20card%22%2C%22readme%22%3A%22%22%2C%22trigger%22%3A%7B%22event%22%3A%22scheduled%22%2C%22action%22%3A%22tick%22%2C%22config%22%3A%7B%22period%22%3A%220%20*%20*%20*%20*%22%7D%7D%2C%22steps%22%3A%5B%7B%22model%22%3A%22openai%3Ao4-mini%22%2C%22prompt%22%3A%22go%20snag%20a%20random%20magic%20card%22%7D%5D%2C%22mcp_servers%22%3A%5B%7B%22name%22%3A%22scryfall%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22scryfall-mcp-server%22%5D%2C%22env%22%3A%7B%7D%7D%5D%7D'
        );
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
    <Scrollable class="!h-content bg-medium relative">
        <Button
            onclick={viewLogs}
            class="border-purple
            text-purple absolute top-6 right-12 mt-2 ml-auto"
        >
            View Logs
        </Button>

        <Flex class="w-full flex-col gap-8 overflow-y-auto p-8">
            {#await check() then update}
                {#if update}
                    <Flex class="w-full items-start gap-4">
                        <section class="w-2/5">
                            <h2 class="font-semibold uppercase">Update</h2>
                            <p class="text-medium font-light">There is an update available</p>
                        </section>

                        <Flex class="w-full items-start">
                            <Button onclick={installUpdate}>Install Tome {update.version}</Button>
                        </Flex>
                    </Flex>
                {/if}
            {/await}
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

            <Flex class="w-full items-start gap-4">
                <section class="w-2/5">
                    <h2 class="font-semibold uppercase">Labs Mode</h2>
                    <p class="text-medium font-light">
                        Enable Labs Mode to play around with experimental features.
                    </p>
                </section>
                <Flex class="w-full flex-col items-start gap-2">
                    <Toggle
                        label=""
                        value={Setting.LabsMode ? 'on' : 'off'}
                        onenable={() => setLabsMode(true)}
                        ondisable={() => setLabsMode(false)}
                    />
                </Flex>
            </Flex>

            {#if Setting.LabsMode}
                <Flex class="w-full items-start gap-4">
                    <section class="w-2/5">
                        <h2 class="font-semibold uppercase">Developer Tools</h2>
                        <p class="text-medium font-light">
                            Tools useful when developing Tome itself.
                        </p>
                    </section>

                    <Flex class="w-full flex-col items-start gap-2">
                        <Flex class="w-full gap-4">
                            <h3>Deeplinks:</h3>
                            <Button class="text-medium border-xlight" onclick={smitheryInstall}>
                                Smithery Install
                            </Button>
                            <Button class="text-medium border-xlight" onclick={importApp}>
                                Import App
                            </Button>
                        </Flex>
                    </Flex>
                </Flex>
            {/if}
        </Flex>
    </Scrollable>
</Layout>
