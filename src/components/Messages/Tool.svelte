<script lang="ts">
	import Flex from '$components/Flex.svelte';
	import Svg from '$components/Svg.svelte';
	import markdown from '$lib/markdown';
	import Message, { type IMessage } from '$lib/models/message';

	interface Props {
		message: IMessage;
	}

	const { message }: Props = $props();
	const response = $derived(Message.find(message.responseId as number));

	let isOpen = $state(false);
	let css = $derived.by(() => (isOpen ? 'rounded-xl w-full' : 'rounded-full'));

	function toggle() {
		isOpen = isOpen ? false : true;
	}

	function format(response: IMessage) {
		try {
			const json = JSON.parse(response.content);
			const str = JSON.stringify(json, null, 4);
			return '```json\n' + str + '\n```';
		} catch {
			return response.content;
		}
	}
</script>

{#each message.toolCalls as call, i (i)}
	<Flex class={`border-light flex-col items-start ${css} mb-8 border p-2 px-3`}>
		<Flex onclick={toggle} class="hover:cursor-pointer">
			<Svg name="MCP" class="text-dark h-4 w-4" />

			<Flex class="gap-2">
				<p class="flex items-center px-3 py-1 text-sm">
					<span class="text-yellow mr-4">{call.function.name}</span>

					{#each Object.entries(call.function.arguments) as [name, value] (name)}
						<span class="text-medium mr-1">{name}:</span>
						<span class="text-light mr-4">{value}</span>
					{/each}
				</p>
			</Flex>
		</Flex>

		{#if isOpen}
			<div
				class="border-light mt-4 mb-1 w-full overflow-auto rounded-md border p-2 px-4 whitespace-pre"
			>
				{@html markdown.render(format(response))}
			</div>
		{/if}
	</Flex>
{/each}
