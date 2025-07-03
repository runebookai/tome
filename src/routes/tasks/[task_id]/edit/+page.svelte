<script lang="ts">
    import { page } from '$app/state';

    import TaskView from '$components/Task.svelte';
    import { Task } from '$lib/models';

    const taskId = Number(page.params.task_id);
    const task: Task = $derived(Task.find(taskId));

    async function save() {
        return await task.save();
    }
</script>

<TaskView {task} onsave={save} />
