<script lang="ts">
    import { goto } from '$app/navigation';

    import Button from './Button.svelte';
    import ModelMenu from './ModelMenu.svelte';

    import Flex from '$components/Flex.svelte';
    import Input from '$components/Input.svelte';
    import List from '$components/List.svelte';
    import PeriodInput from '$components/PeriodInput.svelte';
    import Textarea from '$components/Textarea.svelte';
    import Toggle from '$components/Toggle.svelte';
    import { App, AppStep, Engine, McpServer, Model, Task, Trigger } from '$lib/models';
    import type { ScheduledConfig } from '$lib/models/trigger.svelte';

    interface Props {
        task: Task;
        app: App;
        steps: AppStep[];
        trigger: Trigger;
    }

    let { task, app, steps, trigger }: Props = $props();

    const engines = $derived(Engine.all());
    const isEdit = $derived(task.isPersisted());

    let mcpServers: McpServer[] = $state([]);
    let model: Model = $state(Model.find(steps[0].model) || Model.default());

    async function addMcpServer(mcpServer: McpServer) {
        if (isEdit) {
            app.addMcpServer(mcpServer);
        } else {
            mcpServers.push(mcpServer);
        }
    }

    async function removeMcpServer(mcpServer: McpServer) {
        if (isEdit) {
            app.removeMcpServer(mcpServer);
        } else {
            mcpServers = mcpServers.filter(mcp => mcp !== mcpServer);
        }
    }

    function hasMcpServer(mcpServer: McpServer) {
        if (isEdit) {
            return app.hasMcpServer(mcpServer);
        } else {
            return mcpServers.includes(mcpServer);
        }
    }

    async function setModel(_model: Model) {
        if (isEdit) {
            await steps.awaitAll(async step => {
                step.engineId = Number(_model.engineId);
                step.model = String(_model.id);
                await step.save();
            });
        }

        model = _model;
    }

    async function autosave() {
        if (isEdit) {
            await app.save();
            await task.save();
            await steps.awaitAll(async step => await step.save());
            await trigger.save();
        }
    }

    async function save() {
        app = await app.save();

        task.appId = app.id;
        task = await task.save();

        await steps.awaitAll(async step => {
            step.appId = app.id;
            step.engineId = Number(model.engineId);
            step.model = String(model.id);
            await step.save();
        });

        trigger.appId = app.id;
        await trigger.save();

        await mcpServers.awaitAll(async server => {
            await app.addMcpServer(server);
        });

        goto(`/tasks/${task.id}`);
    }
</script>

{#snippet McpServerView(mcpServer: McpServer)}
    <Flex class="px-3 py-2">
        <Toggle
            label={mcpServer.name}
            value={hasMcpServer(mcpServer) ? 'on' : 'off'}
            onEnable={async () => await addMcpServer(mcpServer)}
            onDisable={async () => await removeMcpServer(mcpServer)}
        />
    </Flex>
{/snippet}

<Flex class="w-full flex-col items-start p-8">
    <h2 class="text-medium mb-4 ml-2 text-xl">Name</h2>
    <Input
        bind:value={app.name}
        label={false}
        name="name"
        class="w-full"
        onchange={autosave}
        placeholder="task name"
    />

    <h2 class="text-medium mt-8 mb-4 ml-2 text-xl">Model</h2>
    <ModelMenu {engines} selected={model} onselect={setModel} />

    {#each steps as step, i (i)}
        <h2 class="text-medium mt-8 mb-4 ml-2 text-xl">Prompt</h2>
        <Textarea
            bind:value={step.prompt}
            label={false}
            name="prompt"
            class="w-full"
            onchange={autosave}
            placeholder="task prompt"
        />
    {/each}

    <h2 class="text-medium mt-8 mb-4 ml-2 text-xl">Frequency</h2>
    <!-- prettier-ignore -->
    <PeriodInput
        bind:value={(trigger.config as ScheduledConfig).period}
        label={false}
        name="period"
        class="ml-3 w-full"
        onchange={autosave}
        placeholder="task period"
    />

    <h2 class="text-medium mt-8 mb-4 ml-2 text-xl">MCP Servers</h2>
    <List
        items={McpServer.all()}
        itemView={McpServerView}
        filterable
        filterProp="name"
        class="border-light rounded-md border"
    />

    {#if !isEdit}
        <Button onclick={save} class="border-purple text-purple mt-8">Save</Button>
    {/if}
</Flex>
