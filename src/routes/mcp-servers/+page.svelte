<script lang="ts">
	import Box from '$components/Box.svelte';
	import Flex from '$components/Flex.svelte';
	import Layout from '$components/Layouts/Default.svelte';
	import Svg from '$components/Svg.svelte';
	import Titlebar from '$components/Titlebar.svelte';
	import McpServer, { type IMcpServer } from '$lib/models/mcp-server';

	let mcpServers: IMcpServer[] = $derived(McpServer.all());

	function addServer() {
		mcpServers.push(McpServer.default());
	}

	async function save(server: IMcpServer) {
		await McpServer.save({
			...server,
			metadata: server.metadata,
		});
	}

	async function destroy(server: IMcpServer) {
		if (!server.id) return;
		await McpServer.delete(server.id);
	}
</script>

{#snippet titlebar()}
	<Titlebar class="h-[60px] w-full">
		<Flex
			class=" border-r-light h-full w-[300px] items-center justify-between border-r px-8 pr-4"
		>
			<h1 class="font-[500]">MCP Servers</h1>
			<button
				class="border-light h-8 w-8 rounded-md border hover:cursor-pointer"
				onclick={() => addServer()}
			>
				<p class="h-8 w-8 text-center !leading-[22px] font-[10px]">+</p>
			</button>
		</Flex>
	</Titlebar>
{/snippet}

<Layout {titlebar}>
	<Flex class="w-full flex-col gap-4 p-8">
		{#each mcpServers as server, i (i)}
			<Box class="m-0 w-full">
				<input
					bind:value={server.command}
					onchange={() => save(server)}
					type="text"
					autocorrect="off"
					autocomplete="off"
					spellcheck={false}
					placeholder="uvx | npx COMMAND [args]"
					class="focus:border-purple/50 text-light w-full rounded-md px-2 outline-none"
				/>

				<button
					onclick={() => destroy(server)}
					class="text-dark hover:text-red ml-4 h-4 w-4 transition duration-300 hover:cursor-pointer"
				>
					<Svg name="Delete" />
				</button>
			</Box>
		{/each}
	</Flex>
</Layout>
