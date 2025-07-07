<script lang="ts">
    import TaskView from '$components/Task.svelte';
    import { App, AppStep, Task, Trigger } from '$lib/models';

    const task: Task = $state(Task.new());
    const app: App = App.new();
    const steps: AppStep[] = [AppStep.new()];
    const trigger: Trigger = Trigger.newScheduled();
</script>

<TaskView {task} {app} {steps} {trigger} />
