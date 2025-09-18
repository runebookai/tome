<script lang="ts">
    import { page } from '$app/state';

    import Editor from '$components/Relays/Editor.svelte';
    import { Relay } from '$lib/models';

    const relay = Relay.find(Number(page.params.relay_id));
    const mcpServers = relay.savableMcpServers;
</script>

{#key relay}
    <Editor {relay} {mcpServers} />
{/key}
