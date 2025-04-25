<script lang="ts">
	import { onMount } from 'svelte';

	import Flex from '$components/Flex.svelte';
	import Thought from '$components/Thought.svelte';
	import markdown from '$lib/markdown';
	import type { IMessage } from '$lib/models/message';

	interface Props {
		message: IMessage;
	}

	const { message }: Props = $props();

	// Rounded css class.
	let rounded = $state('rounded-full');

	// svelte-ignore non_reactive_update
	let ref: HTMLDivElement;

	onMount(() => {
		// If the message spans 2 or more lines, full rounded looks absurd.
		if (ref?.clientHeight > 28) {
			rounded = 'rounded-2xl';
		}
	});
</script>

{#if message.role == 'user'}
	<Flex class={`bg-light self-end ${rounded} px-8 py-3`}>
		<div bind:this={ref}>{message.content}</div>
	</Flex>
{:else}
	{#if message.thought}
		<Thought thought={message.thought} />
	{/if}

	<Flex class="text-medium w-full justify-between p-2 text-xs">
		<p class="message markdown-body text-sm whitespace-normal">
			{@html markdown.render(message.content)}
		</p>
	</Flex>
{/if}
