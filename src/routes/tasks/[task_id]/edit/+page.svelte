<script lang="ts">
    import { page } from '$app/state';

    import TaskView from '$components/Task.svelte';
    import { App, AppStep, Task, Trigger } from '$lib/models';

    const task: Task = $derived(Task.find(Number(page.params.task_id)));
    const app: App = $derived(task.app);
    const steps: AppStep[] = $derived(app.steps);
    const trigger: Trigger = $derived(app.trigger as Trigger);
</script>

<TaskView {task} {app} {steps} {trigger} />
