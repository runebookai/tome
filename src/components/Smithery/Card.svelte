<script lang="ts">
	import Box from '$components/Box.svelte';
	import Flex from '$components/Flex.svelte';
	import Svg from '$components/Svg.svelte';
	import type { CompactServer } from '$lib/smithery';

	interface Props {
		server: CompactServer;
		onInstall: (server: CompactServer) => void | Promise<void>;
	}

	const { server, onInstall }: Props = $props();

	let close: HTMLButtonElement;

	function trunc(text: string, chars: number) {
		return text.substring(0, chars - 3) + '...';
	}

	async function install(e: MouseEvent) {
		e.stopPropagation();
		await onInstall(server);
	}
</script>

<Box class="h-full flex-col items-start px-6">
	<a href={`https://smithery.ai/server/${server.qualifiedName}`} target="_blank">
		<h2>{server.displayName}</h2>
		<p class="text-medium">{trunc(server.description, 80)}</p>

		<div class="grow"></div>

		<Flex class="mt-2 w-full justify-between">
			<Flex title="Use Count" class="text-medium text-xs">
				<Svg name="Pulse" class="text-yellow mr-2 h-4 w-4" />
				{server.useCount}
			</Flex>
			<button
				bind:this={close}
				onclick={install}
				class="border-light hover:text-purple hover:border-purple self-end
        rounded-md border p-2 px-6 text-sm transition duration-300
        hover:cursor-pointer"
			>
				Install
			</button>
		</Flex>
	</a>
</Box>
