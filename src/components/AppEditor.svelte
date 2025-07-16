<script lang="ts">
    import Input from './Input.svelte';

    import Section from '$components/AppEditor/Section.svelte';
    import Button from '$components/Button.svelte';
    import ButtonToggle from '$components/ButtonToggle.svelte';
    import Flex from '$components/Flex.svelte';
    import McpServerList from '$components/McpServerList.svelte';
    import ModelSelect from '$components/ModelSelect.svelte';
    import Select from '$components/Select.svelte';
    import Svg from '$components/Svg.svelte';
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
        <Section icon="Apps" title="Name" tooltip="The name of the App" class="items-center">
            <Input
                label={false}
                name="name"
                placeholder="Name of the app"
                class="text-light outline-0"
                bind:value={app.name}
            />
        </Section>

        <Section
            icon="Trigger"
            title="Trigger"
            tooltip="What triggers the App to execute"
            class="items-center"
        >
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
        </Section>

        {#if trigger.event == 'scheduled'}
            <Section
                icon="Tasks"
                title="Interval"
                tooltip="How often should the App execute"
                class="h-20 items-center"
            >
                <ButtonToggle
                    onchange={setInterval}
                    values={['hourly', 'daily']}
                    bind:value={interval}
                    class="h-full"
                />

                {#if interval == 'daily'}
                    <p class="mx-4">at</p>

                    <Select
                        class="z-50"
                        options={hourOptions}
                        bind:value={scheduledConfig.period}
                    />
                {/if}
            </Section>
        {:else if trigger.event == 'filesystem'}
            <Section
                icon="Folders"
                title="Directory"
                tooltip="The directory Tome will monitor for file events. Must be an absolute path."
            >
                <Flex class="border-b-light grow flex-col items-start">
                    <input
                        class="text-light mb-4 grow font-mono outline-0"
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
            </Section>
        {/if}

        <Section
            icon="Chat"
            title="Prompts"
            tooltip="Prompts are passed to the LLM, in order. History is maintained and passed each time."
        >
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
                                class="ml-1 h-8 w-56 rounded-none border-0 border-r"
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
        </Section>

        <Section
            icon="MCP"
            title="MCP"
            tooltip="The collection of MCP servers to enable when this App executes"
        >
            <Flex class="grow">
                <McpServerList {hasMcpServer} {addMcpServer} {removeMcpServer} />
            </Flex>
        </Section>
    </Flex>

    <Button class="text-purple border-purple mt-8" onclick={save}>Save</Button>
</section>
