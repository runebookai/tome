<script lang="ts">
    import cronstrue from 'cronstrue';
    import type { HTMLAttributes } from 'svelte/elements';

    import Flex from '$components/Flex.svelte';
    import LabeledSection from '$components/Forms/LabeledSection.svelte';
    import { App } from '$lib/models';
    import type { FilesystemConfig, ScheduledConfig } from '$lib/models/trigger.svelte';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        app: App;
    }

    const { app }: Props = $props();

    function readableCron(period: string) {
        return cronstrue.toString(period);
    }
</script>

<Flex class="w-full flex-col items-start">
    <LabeledSection icon="Apps" title="Name">
        <h1 class="font-medium">{app.name}</h1>
    </LabeledSection>

    <LabeledSection icon="Trigger" title="Trigger">
        <p class="capitalize">{app.trigger.event}</p>
    </LabeledSection>

    {#if app.trigger.event == 'scheduled'}
        <LabeledSection icon="Tasks" title="Interval">
            <p>{readableCron((app.trigger.config as ScheduledConfig).period)}</p>
        </LabeledSection>
    {:else}
        <LabeledSection icon="Folders" title="Directory">
            <p>{(app.trigger.config as FilesystemConfig).path}</p>
        </LabeledSection>
    {/if}

    <LabeledSection icon="Chat" title="Prompts">
        <Flex class="w-full flex-col items-start">
            {#each app.steps as step (step.id)}
                <Flex class="border-light mb-2 -ml-4 w-full rounded-sm border p-2">
                    <p class="ml-2 grow">{step.prompt}</p>
                    <p class="bg-light text-medium rounded-sm p-1 px-2 text-xs font-light">
                        {step.model?.id}
                    </p>
                </Flex>
            {/each}
        </Flex>
    </LabeledSection>
</Flex>
