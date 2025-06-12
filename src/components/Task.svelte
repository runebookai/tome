<script lang="ts">
    import Flex from '$components/Flex.svelte';
    import Input from '$components/Input.svelte';
    import PeriodInput from './PeriodInput.svelte';
    import { Task } from '$lib/models';

    interface Props {
        task: Task;
    }

    let { task }: Props = $props();
    
    let name = $state('');
    let prompt = $state('');
    let period = $state('');

    $effect.pre(() => {
        if (task) {
            name = task.name;
            prompt = task.prompt;
            period = task.period;
        }
    })

    async function save(): Promise<void> {
        task.name = name;
        task.prompt = prompt;
        task.period = period;
        task.next_run = await task.calculate_next_run();
        console.log(task.next_run);
        task = await task.save();
    }
</script>

<Flex class="w-full flex-col items-start">
    <h1 class="text-purple mb-4 ml-4 text-2xl">{task?.id}</h1>

    <h2 class="text-medium mt-8 mb-4 ml-4 text-xl">Name</h2>
    <Input
        bind:value={name}
        label={false}
        name="name"
        class="w-full"
        onchange={save}
        placeholder="task name"
    />

    <h2 class="text-medium mt-8 mb-4 ml-4 text-xl">Prompt</h2>
    <Input
        bind:value={prompt}
        label={false}
        name="prompt"
        class="w-full"
        onchange={save}
        placeholder="task prompt"
    />

    <h2 class="text-medium mt-8 mb-4 ml-4 text-xl">Frequency</h2>
    <PeriodInput
        bind:value={period}
        label={false}
        name="period"
        class="w-full"
        onchange={save}
        placeholder="task period"
    />
    <p>Component Period: {period}</p>
    <p>Task Period: {task.period}</p>

    <p>Task Next Run: {task.next_run}</p>
    <p>Task Should Run?: {task.should_run()}</p>
</Flex>
