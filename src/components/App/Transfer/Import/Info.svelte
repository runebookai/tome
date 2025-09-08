<script lang="ts">
    import cronstrue from 'cronstrue';
    import type { HTMLAttributes } from 'svelte/elements';

    import Flex from '$components/Flex.svelte';
    import LabeledSection from '$components/Forms/LabeledSection.svelte';
    import Icon from '$components/Icon.svelte';
    import Tooltip from '$components/Tooltip.svelte';
    import type { SerializedApp } from '$lib/apps';
    import { Model } from '$lib/models';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        app: SerializedApp;
    }

    const { app }: Props = $props();

    function readableCron(period: string) {
        return cronstrue.toString(period);
    }

    function modelMissing(id: string) {
        return !Model.exists({ id });
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

    <LabeledSection icon="Chat" title="Prompts">
        <Flex class="w-full flex-col items-start">
            {#each app.steps as step, i (i)}
                <Flex class="border-light mb-2 -ml-4 w-full rounded-sm border p-2">
                    <p class="ml-2 grow">{step.prompt}</p>

                    {#if modelMissing(step.model)}
                        <Tooltip text="You must install this model before importing the app.">
                            <p
                                class="bg-light text-red flex items-center rounded-sm p-1 px-2 text-xs font-light"
                            >
                                <Icon name="Warning" class="mr-2 h-3 w-3" />
                                {step.model}
                            </p>
                        </Tooltip>
                    {:else}
                        <p class="bg-light text-medium rounded-sm p-1 px-2 text-xs font-light">
                            {step.model}
                        </p>
                    {/if}
                </Flex>
            {/each}
        </Flex>
    </LabeledSection>
</Flex>
