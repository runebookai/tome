<script lang="ts">
    import TaskView from '$components/Task.svelte';
    import { Task } from '$lib/models';

    const task: Task = $state(Task.new());
</script>

<TaskView {task} />
