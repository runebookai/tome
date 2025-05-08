<script lang="ts">
	import { page } from '$app/state';

	import McpServerView from '$components/McpServer.svelte';
	import McpServer, { type IMcpServer } from '$lib/models/mcp-server';

	const server: IMcpServer = $derived(McpServer.find(Number(page.params.id)));
</script>

<McpServerView {server} />
