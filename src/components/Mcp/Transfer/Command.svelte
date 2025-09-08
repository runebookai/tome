<script lang="ts">
    import LabeledSection from '$components/Forms/LabeledSection.svelte';
    import type { SerializedMcpServer } from '$lib/apps';

    interface Props {
        server: SerializedMcpServer;
    }

    const { server }: Props = $props();
</script>

<LabeledSection
    icon="Command"
    title="Command"
    tooltip="Shell command to run the server"
    class="text-medium"
>
    <p class="text-light">{server.command}</p>
</LabeledSection>
