<script lang="ts">
    import TaskView from '$components/Task.svelte';
    import { Task } from '$lib/models';

    const task: Task = $state(Task.new());

    async function save() {
        await task.save();
    }
</script>

<TaskView {task} onsave={save} />
