<script lang="ts">
	import { page } from '$app/state';

	import McpServerView from '$components/McpServer.svelte';
	import McpServer, { type IMcpServer } from '$lib/models/mcp-server';

	const server: IMcpServer = $derived(McpServer.findBy({ name: page.params.name }));
</script>

<McpServerView {server} />
