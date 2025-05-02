<script lang="ts">
	import Flex from '$components/Flex.svelte';
	import Thought from '$components/Messages/Thought.svelte';
	import markdown from '$lib/markdown';
	import type { IMessage } from '$lib/models/message';

	interface Props {
		message: IMessage;
	}

	const { message }: Props = $props();
</script>

{#if message.thought}
	<Thought thought={message.thought} />
{/if}

<Flex class="assistant text-medium mb-6 w-full justify-between p-2 text-xs">
	<p class="message markdown-body text-sm whitespace-normal">
		{@html markdown.render(message.content)}
	</p>
</Flex>
