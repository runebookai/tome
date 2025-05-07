<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import Button from '$components/Button.svelte';
	import Flex from '$components/Flex.svelte';
	import Layout from '$components/Layouts/Default.svelte';
	import Modal from '$components/Modal.svelte';
	import type { InstallMcpServerPayload } from '$lib/deeplinks';
	import McpServer from '$lib/models/mcp-server';

	const payload = page.url.searchParams.get('payload') as string;
	const cmd: InstallMcpServerPayload = JSON.parse(payload);

	async function install() {
		const server = await McpServer.create(cmd);
		goto(`/mcp-servers/${server.name}`);
	}

	function cancel() {
		goto('/mcp-servers');
	}
</script>

<Layout>
	<Modal close={cancel}>
		<Flex class="w-full flex-col items-start">
			<h2 class="ml-2">Install {cmd.args[0]}?</h2>

			<Flex
				class="border-light mt-4 w-full flex-col items-start rounded-md
                border border-b-0"
			>
				<h3 class="text-medium p-2 text-sm">Command</h3>
				<Flex class="border-light w-full overflow-x-scroll border p-2 pl-4">
					<code>
						{cmd.command}
						{cmd.args.join(' ')}
					</code>
				</Flex>
			</Flex>

			<Flex
				class="border-light mt-4 w-full flex-col items-start
                rounded-md border border-b-0"
			>
				<h3 class="text-medium p-2 text-sm">ENV</h3>
				<Flex
					class="border-t-light grid w-full auto-cols-max
                    auto-rows-max grid-cols-2 border-t text-sm"
				>
					{#each Object.entries(cmd.env) as [key, value] (key)}
						<p class="border-b-light border-r-light border-r border-b p-2 pl-4">
							{key}
						</p>
						<p class="border-b-light border-b p-2 pl-4">{value}</p>
					{/each}
				</Flex>
			</Flex>
			<Flex class="mt-8 self-end">
				<Button onclick={cancel} class="text-medium border-0">Cancel</Button>
				<Button onclick={install} class="border-purple text-purple">Install</Button>
			</Flex>
		</Flex>
	</Modal>
</Layout>
