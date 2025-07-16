<script lang="ts">
    import Button from './Button.svelte';
    import ButtonToggle from './ButtonToggle.svelte';
    import McpServerList from './McpServerList.svelte';
    import ModelSelect from './ModelSelect.svelte';
    import Select from './Select.svelte';
    import Svg from './Svg.svelte';

    import Flex from '$components/Flex.svelte';
    import Textarea from '$components/Textarea.svelte';
    import { App, AppStep, McpServer, Model, Trigger } from '$lib/models';
    import type { FilesystemConfig, ScheduledConfig } from '$lib/models/trigger.svelte';

    interface Props {
        app: App;
    }

    let { app }: Props = $props();

    let trigger: Trigger = $state(app.trigger);
    let steps: AppStep[] = $state(app.steps);
    let mcpServers: McpServer[] = $state(app.mcpServers);
    let interval: 'hourly' | 'daily' = $state('hourly');

    let scheduledConfig: ScheduledConfig = $state({
        period: (trigger.config as ScheduledConfig).period,
    });

    let filesystemConfig: FilesystemConfig = $state({
        path: (trigger.config as FilesystemConfig).path,
    });

    const hourOptions = Array.from({ length: 24 }, (_, i) => {
        const hour = i % 12 === 0 ? 12 : i % 12;
        const ampm = i < 12 ? 'AM' : 'PM';
        return { label: `${hour}:00 ${ampm}`, value: `0 ${i} * * *` };
    });

    function setModel(step: AppStep, model: Model) {
        step.engineId = model.engineId as number;
        step.modelId = model.id as string;
    }

    function setInterval(interval: string) {
        scheduledConfig.period = interval == 'hourly' ? '0 * * * *' : '0 12 * * *';
    }

    function addStep() {
        steps.push(AppStep.new({ appId: app.id }));
    }

    function removeStep(step: AppStep) {
        steps = steps.filter(s => s !== step);
    }

    function hasMcpServer(server: McpServer) {
        return mcpServers.includes(server);
    }

    function addMcpServer(server: McpServer) {
        mcpServers.push(server);
    }

    function removeMcpServer(server: McpServer) {
        mcpServers = mcpServers.filter(s => s !== server);
    }

    function setEvent(event: Trigger['event']) {
        trigger.event = event;
        trigger.config = event == 'scheduled' ? scheduledConfig : filesystemConfig;
    }

    async function save() {
        app = await app.save();

        trigger.appId = app.id;
        await trigger.save();

        await steps.awaitAll(async step => {
            step.appId = app.id;
            await step.save();
        });

        await mcpServers.awaitAll(async server => {
            await app.addMcpServer(server);
        });
    }
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
                bind:value={app.name}
            />
        </Flex>

        <Flex id="trigger" class="border-b-light w-full border-b p-4">
            <label for="name" class="flex w-[150px] items-center text-sm">
                <Svg name="Trigger" class="mr-3 h-5 w-5" />
                Trigger
            </label>

            <Button
                onclick={() => setEvent('scheduled')}
                class={`border-light mr-4 ${trigger.event == 'scheduled' ? 'text-light' : ''}`}
            >
                Scheduled
            </Button>

            <Button
                onclick={() => setEvent('filesystem')}
                class={`border-light mr-4 ${trigger.event == 'filesystem' ? 'text-light' : ''}`}
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

                <ButtonToggle
                    onchange={setInterval}
                    values={['hourly', 'daily']}
                    bind:value={interval}
                    class="h-full"
                />

                {#if interval == 'daily'}
                    <p class="mx-4">at</p>

                    <!-- prettier strips the leading "(" -->
                    <!-- prettier-ignore -->
                    <Select
                        class="z-50"
                        options={hourOptions}
                        bind:value={scheduledConfig.period}
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
                        type="text"
                        bind:value={filesystemConfig.path}
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
                        class="border-light relative mb-8 w-full
                        flex-col items-start rounded-md border"
                    >
                        <Flex
                            class="border-b-light w-full items-center
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
