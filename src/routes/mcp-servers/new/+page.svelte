<script lang="ts">
    import McpServerView from '$components/McpServer.svelte';
    import { McpServer } from '$lib/models';

    const server: McpServer = $state(McpServer.new());
</script>

<McpServerView {server} />
