<script lang="ts">
	import { goto } from '$app/navigation';

	import Deleteable from '$components/Deleteable.svelte';
	import Flex from '$components/Flex.svelte';
	import Layout from '$components/Layouts/Default.svelte';
	import Link from '$components/Link.svelte';
	import List from '$components/List.svelte';
	import type { MenuItem } from '$components/Menu.svelte';
	import Menu from '$components/Menu.svelte';
	import Svg from '$components/Svg.svelte';
	import Titlebar from '$components/Titlebar.svelte';
	import McpServer, { type IMcpServer } from '$lib/models/mcp-server';

	interface Registry {
		name: string;
		icon: string;
	}

	const { children } = $props();

	let mcpServers: IMcpServer[] = $derived(McpServer.all());
	let registries: Registry[] = [
		{
			name: 'Smithery',
			icon: 'Smithery',
		},
	];

	function items(server: IMcpServer): MenuItem[] {
		return [
			{
				label: 'Delete',
				style: 'text-red hover:bg-red hover:text-white',
				onclick: async () => await destroy(server),
			},
		];
	}

	async function destroy(server: IMcpServer) {
		await McpServer.delete(server.id as number);
		goto(`/mcp-servers`);
	}
</script>

{#snippet titlebar()}
	<Titlebar class="h-[60px] w-full">
		<Flex
			class=" border-r-light h-full w-[300px] items-center justify-between border-r px-8 pr-4"
		>
			<h1 class="font-[500]">MCP Servers</h1>
			<a
				href="/mcp-servers/new"
				class="border-light h-8 w-8 rounded-md border hover:cursor-pointer"
			>
				<p class="h-8 w-8 text-center !leading-[22px] font-[10px]">+</p>
			</a>
		</Flex>
	</Titlebar>
{/snippet}

{#snippet McpServerView(server: IMcpServer)}
	<Menu items={items(server)}>
		<Deleteable ondelete={() => destroy(server)}>
			<Link
				href={`/mcp-servers/${server.id}`}
				class="w-full py-3 pl-8 text-sm hover:cursor-pointer"
				activeClass="text-purple border-l border-l-purple"
			>
				{server.name}
			</Link>
		</Deleteable>
	</Menu>
{/snippet}

{#snippet RegistryView(registry: Registry)}
	<Link
		href={`/mcp-servers/${registry.name.toLowerCase()}`}
		class="mb-4 flex h-full w-full items-center pl-8"
		activeClass="text-purple"
	>
		<Svg name={registry.icon} class="mr-4 h-6 w-6" />
		{registry.name}
	</Link>
{/snippet}

<Layout {titlebar}>
	<Flex class="h-full items-start">
		<Flex class="border-r-light h-full w-[300px] flex-col items-start border-r">
			<List items={mcpServers} itemView={McpServerView} />
			<List
				items={registries}
				itemView={RegistryView}
				borderless
				title="Registries"
				class="mt-4"
				titleClass="pl-8 my-4"
			/>
		</Flex>

		<Flex class="h-full w-[calc(100%-300px)] items-start p-8">
			{@render children?.()}
		</Flex>
	</Flex>
</Layout>
