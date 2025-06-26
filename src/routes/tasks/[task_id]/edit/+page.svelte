<script lang="ts">
    import { page } from '$app/state';

    import Flex from '$components/Flex.svelte';
    import Input from '$components/Input.svelte';
    import List from '$components/List.svelte';
    import PeriodInput from '$components/PeriodInput.svelte';
    import Textarea from '$components/Textarea.svelte';
    import Toggle from '$components/Toggle.svelte';
    import { McpServer, Task } from '$lib/models';

    const taskId = Number(page.params.task_id);
    const task: Task = $derived(Task.find(taskId));

    async function save(): Promise<void> {
        await task.save();
    }
</script>

{#snippet McpServerView(mcpServer: McpServer)}
    <Flex class="px-3 py-2">
        <Toggle
            label={mcpServer.name}
            value={task.hasMcpServer(mcpServer) ? 'on' : 'off'}
            onEnable={() => task.addMcpServer(mcpServer)}
            onDisable={() => task.removeMcpServer(mcpServer)}
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
        onchange={save}
        placeholder="task name"
    />

    <h2 class="text-medium mt-8 mb-4 ml-2 text-xl">Prompt</h2>
    <Textarea
        bind:value={task.prompt}
        label={false}
        name="prompt"
        class="w-full"
        onchange={save}
        placeholder="task prompt"
    />

    <h2 class="text-medium mt-8 mb-4 ml-2 text-xl">Frequency</h2>
    <PeriodInput
        bind:value={task.period}
        label={false}
        name="period"
        class="ml-3 w-full"
        onchange={save}
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
</Flex>
