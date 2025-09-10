<script lang="ts">
    import { capitalCase } from 'change-case';
    import cronstrue from 'cronstrue';
    import type { HTMLAttributes } from 'svelte/elements';

    import Flex from '$components/Flex.svelte';
    import LabeledSection from '$components/Forms/LabeledSection.svelte';
    import Icon from '$components/Icon.svelte';
    import { App, Model } from '$lib/models';
    import type { FilesystemConfig, ScheduledConfig } from '$lib/models/trigger.svelte';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        app: App;
    }

    const { app }: Props = $props();
    const model: Model = app.steps[0]?.model as Model;
    const icon = capitalCase(model.engine.type == 'openai-compat' ? 'openai' : model.engine.type);

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

    <LabeledSection icon="Models" title="Model">
        <Flex class="w-full items-center">
            <Icon name={icon} class="mt-1 mr-2 h-4 w-4" />
            <p>{model.id}</p>
        </Flex>
    </LabeledSection>

    <LabeledSection icon="Chat" title="Prompts">
        <Flex class="w-full flex-col items-start">
            {#each app.steps as step (step.id)}
                <Flex class="border-light mb-2 -ml-4 w-full rounded-sm border p-2">
                    <p class="ml-2 grow">{step.prompt}</p>
                </Flex>
            {/each}
        </Flex>
    </LabeledSection>
</Flex>
