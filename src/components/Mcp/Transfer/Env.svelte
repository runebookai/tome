<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';

    import LabeledSection from '$components/Forms/LabeledSection.svelte';
    import type { SerializedMcpServer } from '$lib/apps';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        server: SerializedMcpServer;
    }

    const { server, children }: Props = $props();
</script>

{#if Object.keys(server.env).length}
    <LabeledSection icon="Env" title="ENV" tooltip="Environment variables" class="text-medium">
        {@render children?.()}
    </LabeledSection>
{/if}
