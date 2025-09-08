<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';

    import Flex from '$components/Flex.svelte';
    import LabeledSection from '$components/Forms/LabeledSection.svelte';
    import type { SerializedMcpServer } from '$lib/apps';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        server: SerializedMcpServer;
    }

    const { server, children }: Props = $props();
</script>

{#if server.args.length}
    <LabeledSection
        icon="Command"
        title="Args"
        tooltip="CLI args passed to the command"
        class="text-medium pb-2"
    >
        {@render children?.()}
    </LabeledSection>
{/if}
