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
    import { Engine, McpServer, Model, Task } from '$lib/models';

    interface Props {
        task: Task;
        onsave?: () => Task | Promise<Task>;
    }

    const { task, onsave }: Props = $props();
    const engines = $derived(Engine.all());
    const isEdit = $derived(task.id !== undefined);

    let mcpServers: McpServer[] = $state([]);
    let model: Model = $state((task.model && Model.find(task.model)) || Model.default());

    async function addMcpServer(mcpServer: McpServer) {
        if (isEdit) {
            task.addMcpServer(mcpServer);
        } else {
            mcpServers.push(mcpServer);
        }
    }

    async function removeMcpServer(mcpServer: McpServer) {
        if (isEdit) {
            task.removeMcpServer(mcpServer);
        } else {
            mcpServers = mcpServers.filter(mcp => mcp !== mcpServer);
        }
    }

    function hasMcpServer(mcpServer: McpServer) {
        if (isEdit) {
            return task.hasMcpServer(mcpServer);
        } else {
            return mcpServers.includes(mcpServer);
        }
    }

    async function setModel(_model: Model) {
        task.engineId = Number(_model.engineId);
        task.model = String(_model.id);

        if (isEdit) {
            await onsave?.();
        }

        model = _model;
    }

    async function autosave() {
        if (isEdit) {
            await onsave?.();
        }
    }

    async function save() {
        const task = await onsave?.();

        if (task) {
            mcpServers.forEach(server => task.addMcpServer(server));
            goto(`/tasks/${task.id}`);
        }
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
        bind:value={task.name}
        label={false}
        name="name"
        class="w-full"
        onchange={autosave}
        placeholder="task name"
    />

    <h2 class="text-medium mt-8 mb-4 ml-2 text-xl">Model</h2>
    <ModelMenu {engines} selected={model} onselect={setModel} />

    <h2 class="text-medium mt-8 mb-4 ml-2 text-xl">Prompt</h2>
    <Textarea
        bind:value={task.prompt}
        label={false}
        name="prompt"
        class="w-full"
        onchange={autosave}
        placeholder="task prompt"
    />

    <h2 class="text-medium mt-8 mb-4 ml-2 text-xl">Frequency</h2>
    <PeriodInput
        bind:value={task.period}
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
