<script lang="ts">
    import Button from './Button.svelte';
    import ButtonToggle from './ButtonToggle.svelte';
    import List from './List.svelte';
    import McpServerList from './McpServerList.svelte';
    import ModelMenu from './ModelMenu.svelte';
    import ModelSelect from './ModelSelect.svelte';
    import Select from './Select.svelte';
    import Svg from './Svg.svelte';
    import Toggle from './Toggle.svelte';

    import Flex from '$components/Flex.svelte';
    import Textarea from '$components/Textarea.svelte';
    import { App, AppStep, McpServer, Model, Trigger } from '$lib/models';
    import type { FilesystemConfig, ScheduledConfig } from '$lib/models/trigger.svelte';

    interface Props {
        app: App;
        steps: AppStep[];
        trigger: Trigger;
    }

    let { app, trigger }: Props = $props();
    let steps = $state(app.steps);
    let interval: 'hourly' | 'daily' = $state('hourly');

    let mcpServers: McpServer[] = $state([]);
    let model: Model = $state(app.steps[0].model || Model.default());

    const hourOptions = Array.from({ length: 24 }, (_, i) => {
        const hour = i % 12 === 0 ? 12 : i % 12;
        const ampm = i < 12 ? 'AM' : 'PM';
        return { label: `${hour}:00 ${ampm}`, value: `0 ${i} * * *` };
    });

    function setModel(step: AppStep, model: Model) {
        step.engineId = model.engineId as number;
        step.modelId = model.id as string;
    }

    function addStep() {
        steps.push(AppStep.new({ appId: app.id }));
    }

    function hasMcpServer(server: McpServer) {
        return false;
    }

    function addMcpServer(server: McpServer) {}

    function removeMcpServer(server: McpServer) {}

    function removeStep(step: AppStep) {
        steps = steps.filter(s => s !== step);
    }

    function save() {}
</script>

<section class="w-full overflow-y-auto p-8">
    <Flex class="border-light text-medium w-full flex-col items-start rounded-md border">
        <Flex id="name" class="border-b-light w-full border-b p-4">
            <label for="name" class="flex w-[150px] items-center text-sm">
                <Svg name="Apps" class="mr-3 h-5 w-5" />
                Name
            </label>

            <input
                type="text"
                name="name"
                placeholder="Name of the app"
                class="text-light outline-0"
            />
        </Flex>

        <Flex id="trigger" class="border-b-light w-full border-b p-4">
            <label for="name" class="flex w-[150px] items-center text-sm">
                <Svg name="Trigger" class="mr-3 h-5 w-5" />
                Trigger
            </label>

            <Button
                onclick={() => (trigger.event = 'scheduled')}
                class={`border-xlight mr-4 ${trigger.event == 'scheduled' ? 'text-light' : ''}`}
            >
                Scheduled
            </Button>

            <Button
                onclick={() => (trigger.event = 'filesystem')}
                class={`border-xlight mr-4 ${trigger.event == 'filesystem' ? 'text-light' : ''}`}
            >
                Filesystem
            </Button>
        </Flex>

        {#if trigger.event == 'scheduled'}
            <Flex id="interval" class="border-b-light h-20 w-full border-b p-4">
                <label for="name" class="flex w-[150px] items-center text-sm">
                    <Svg name="Tasks" class="mr-3 h-5 w-5" />
                    Interval
                </label>

                <ButtonToggle values={['hourly', 'daily']} bind:value={interval} class="h-full" />

                {#if interval == 'daily'}
                    <p class="mx-4">at</p>
                    <Select
                        class="z-50"
                        options={hourOptions}
                        value={(trigger.config as ScheduledConfig).period}
                    />
                {/if}
            </Flex>
        {:else if trigger.event == 'filesystem'}
            <Flex id="directory" class="border-b-light w-full items-start border-b p-4 pt-6">
                <label for="directory" class="flex w-[150px] items-center text-sm">
                    <Svg name="Folders" class="mr-3 h-4.5 w-4.5" />
                    Directory
                </label>

                <Flex class="border-b-light grow flex-col items-start">
                    <!-- prettier strips the leading "(" -->
                    <!-- prettier-ignore -->
                    <input 
                        class="outline-0 grow font-mono text-light mb-4"
                        placeholder="/path/to/watch-for-changes"
                        type="text" bind:value={(trigger.config as FilesystemConfig).path}
                    />

                    <Flex class="gap-4">
                        <Flex>
                            <input
                                bind:group={trigger.action}
                                class="text-medium"
                                id="created"
                                value="created"
                                type="radio"
                            />
                            <label class="ml-2" for="created">File Created</label>
                        </Flex>

                        <Flex>
                            <input
                                bind:group={trigger.action}
                                id="updated"
                                value="updated"
                                type="radio"
                            />
                            <label class="ml-2" for="updated">File Updated</label>
                        </Flex>

                        <Flex>
                            <input
                                bind:group={trigger.action}
                                id="deleted"
                                value="deleted"
                                type="radio"
                            />
                            <label class="ml-2" for="deleted">File Deleted</label>
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        {/if}

        <Flex id="prompts" class="border-b-light w-full items-start border-b p-4">
            <label for="prompts" class="flex w-[150px] items-center text-sm">
                <Svg name="Chat" class="mr-3 h-5 w-5" />
                Prompts
            </label>

            <Flex class="grow flex-col items-start">
                {#each steps as step, i (i)}
                    <Flex
                        class="border-xlight relative mb-8 w-full
                        flex-col items-start rounded-md border"
                    >
                        <Flex
                            class="border-b-xlight w-full items-center
                            justify-between border-b"
                        >
                            <ModelSelect
                                class="ml-1 h-8 w-56 rounded-none border-0
                                border-r"
                                selected={step.model}
                                onselect={async model => setModel(step, model)}
                            />

                            <Button onclick={() => removeStep(step)} class="border-0 px-3">
                                <Svg name="Delete" class="h-4 w-4" />
                            </Button>
                        </Flex>

                        <Textarea
                            label={false}
                            bind:value={step.prompt}
                            placeholder="Add a prompt"
                            class="text-light bg-medium border-0 p-2 px-4"
                        />

                        <button
                            onclick={addStep}
                            class={`border-xlight bg-dark text-medium absolute
                            -bottom-4 left-[calc(50%-96px)] flex h-8 w-8
                            flex-col content-center items-center rounded-full
                            border font-mono leading-7.5 font-bold hover:cursor-pointer
                            ${i !== steps.length - 1 ? 'hidden' : ''}`}
                        >
                            +
                        </button>

                        {#if i !== steps.length - 1}
                            <div
                                class="bg-light absolute -bottom-8 left-[calc(50%-83px)] h-8 w-[2px]"
                            ></div>
                        {/if}
                    </Flex>
                {/each}
            </Flex>
        </Flex>

        <Flex id="mcp" class="w-full items-start p-4">
            <label class="flex w-[150px] items-center text-sm">
                <Svg name="MCP" class="mr-3 h-5 w-5" />
                MCP
            </label>

            <Flex class="grow">
                <McpServerList {hasMcpServer} {addMcpServer} {removeMcpServer} />
            </Flex>
        </Flex>
    </Flex>

    <Button class="text-purple border-purple mt-8" onclick={save}>Save</Button>
</section>
