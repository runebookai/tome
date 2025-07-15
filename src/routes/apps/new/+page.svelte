<script lang="ts">
    import AppEditor from '$components/AppEditor.svelte';
    import { App, AppStep, Trigger } from '$lib/models';

    const app: App = App.new();
    const steps: AppStep[] = [AppStep.new()];
    const trigger: Trigger = Trigger.newScheduled();
</script>

<AppEditor {app} {steps} {trigger} />
