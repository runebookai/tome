<script lang="ts">
    import Editor from '$components/Relays/Editor.svelte';
    import { McpServer, Relay } from '$lib/models';

    const relay: Relay = Relay.new();
    const mcpServers: McpServer[] = relay.savableMcpServers;
</script>

<Editor {relay} {mcpServers} />
