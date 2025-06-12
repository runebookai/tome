<script lang="ts">
    import { page } from '$app/state';

    import TaskView from '$components/Task.svelte';
    import Task from '$lib/models/task.svelte';

    const task: Task = $derived(Task.find(Number(page.params.id)));
</script>

<TaskView {task} />
