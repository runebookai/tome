<script lang="ts">
    import cronstrue from 'cronstrue';
    import type { HTMLAttributes } from 'svelte/elements';

    import Flex from '$components/Flex.svelte';
    import LabeledSection from '$components/Forms/LabeledSection.svelte';
    import ModelSelect from '$components/ModelSelect.svelte';
    import type { SerializedApp } from '$lib/apps';
    import { Model } from '$lib/models';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        app: SerializedApp;
    }

    const { app }: Props = $props();

    let model: Model = $state(Model.findByOrDefault({ id: app.steps[0].model }));

    function readableCron(period: string) {
        return cronstrue.toString(period);
    }

    async function setModel(model: Model) {
        for (const step of app.steps) {
            step.model = model.id as string;
        }
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
            <p>{readableCron(app.trigger.config.period as string)}</p>
        </LabeledSection>
    {:else}
        <LabeledSection icon="Folders" title="Directory">
            <p>{app.trigger.config.path}</p>
        </LabeledSection>
    {/if}

    <LabeledSection icon="Models" title="Model">
        <ModelSelect selected={model} onselect={setModel} class="h-10" />
    </LabeledSection>

    <LabeledSection icon="Chat" title="Prompts">
        <Flex class="w-full flex-col items-start">
            {#each app.steps as step, i (i)}
                <Flex class="border-light mb-2 -ml-4 w-full rounded-sm border p-2">
                    <p class="ml-2 grow">{step.prompt}</p>
                </Flex>
            {/each}
        </Flex>
    </LabeledSection>
</Flex>
