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
    import { App, AppStep, Engine, McpServer, Model, Trigger } from '$lib/models';
    import type { ScheduledConfig } from '$lib/models/trigger.svelte';

    interface Props {
        app: App;
        steps: AppStep[];
        trigger: Trigger;
    }

    let { app, steps, trigger }: Props = $props();

    const engines = $derived(Engine.all());
    const isEdit = $derived(app.isPersisted());

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
            await steps.awaitAll(async step => await step.save());
            await trigger.save();
        }
    }

    async function save() {
        app = await app.save();

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

        goto(`/apps/${app.id}`);
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
    <Input
        bind:value={app.name}
        label="Name"
        required
        name="name"
        class="w-full"
        onchange={autosave}
        placeholder="Untitled"
    />

    <Flex class="border-light w-full flex-col items-start rounded-md border p-4">
        <h2 class="text-medium mb-4 ml-2 text-sm">Prompt(s)</h2>

        <Flex class="w-full flex-col items-center">
            {#each steps as step, i (i)}
                <Textarea
                    bind:value={step.prompt}
                    label={false}
                    name="prompt"
                    class="w-full"
                    onchange={autosave}
                    placeholder="Tell me a random fact from MTG lore..."
                />

                <div class="border-xlight h-2 w-0 border"></div>
                <button
                    class="border-xlight flex h-8 w-8 content-center items-center justify-center rounded-full border font-mono"
                >
                    +
                </button>
            {/each}
        </Flex>
    </Flex>

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
