<script lang="ts">
    import Flex from '$components/Flex.svelte';
    import LabeledSection from '$components/Forms/LabeledSection.svelte';
    import Svg from '$components/Svg.svelte';
    import Table from '$components/Table.svelte';
    import type { SerializedMcpServer } from '$lib/apps';

    interface Props {
        server: SerializedMcpServer;
    }

    const { server }: Props = $props();

    const rows = $derived(
        Object.entries(server.env).map(([key, value]) => ({
            cols: [
                {
                    value: key,
                    editable: false,
                },
                {
                    value,
                    editable: value === null,
                    placeholder: 'REQUIRED',
                },
            ],
        }))
    );
</script>

<Flex class="border-light mb-4 w-full flex-col items-start rounded-md border p-0">
    <Flex class="border-light w-full border-b p-4 py-4 pl-6">
        <Svg name="MCP" class="mr-2 h-4 w-4" />
        <p class="font-medium">{server.name}</p>
    </Flex>

    <LabeledSection
        icon="Command"
        title="Command"
        tooltip="Shell command to run the server"
        class="text-medium"
    >
        <p class="text-light">{server.command}</p>
    </LabeledSection>

    <LabeledSection
        icon="Command"
        title="Args"
        tooltip="CLI args passed to the command"
        class="text-medium pb-2"
    >
        <Flex class="text-light flex-wrap font-mono">
            {#each server.args as arg, i (i)}
                {#if arg === null}
                    <input
                        class="focus:border-purple/50 border-xlight mr-2 mb-2 inline-block rounded-sm border px-2 outline-none"
                        placeholder="REQUIRED"
                    />
                {:else}
                    <p
                        class="border-light mr-2 mb-2 inline-block rounded-sm border p-0 px-2 whitespace-nowrap"
                    >
                        {arg}
                    </p>
                {/if}
            {/each}
        </Flex>
    </LabeledSection>

    <LabeledSection icon="Env" title="ENV" tooltip="Environment variables" class="text-medium">
        {#if rows.length > 0}
            <Table {rows} colClass="font-mono" inputClass="font-mono border-xlight" />
        {:else}
            –––
        {/if}
    </LabeledSection>
</Flex>
