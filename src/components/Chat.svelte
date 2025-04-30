<script lang="ts">
	import { onMount } from 'svelte';

	import Flex from '$components/Flex.svelte';
	import Message from '$components/Message.svelte';
	import { dispatch } from '$lib/dispatch';
	import type { IMessage } from '$lib/models/message';
	import Model from '$lib/models/model.svelte';
	import Session, { type ISession } from '$lib/models/session';

	interface Props {
		session: ISession;
		model: string;
		onMessages?: (message: IMessage[]) => Promise<void>;
	}

	const { session, model }: Props = $props();

	// DOM elements used via `bind:this`
	let input: HTMLTextAreaElement;
	let content: HTMLDivElement;

	// Full history of chat messages in this session
	const messages: IMessage[] = $derived(Session.messages(session));

	// Is the LLM processing (when true, we show the ellipsis)
	let loading = $state(false);

	// Scroll the chat history box to the bottom
	//
	function scrollToBottom(_: HTMLElement) {
		if (content) {
			// Scroll to the maximum integer JS can handle, to ensure we're at the
			// bottom. `scrollHeight` doesn't work here for some mysterious reason.
			// ¯\_(ツ)_/¯
			content.scroll({ top: 9e15 });
		}
	}

	function resize() {
		const min = 56; // Default height of the input
		const scrollHeight = input.scrollHeight;
		const padding = scrollHeight > min ? 6 : 0;
		const scroll = Math.max(56, input.scrollHeight) + padding;
		const height = /^\s*$/.test(input.value) ? '56px' : `${scroll}px`;
		input.style.height = '0px';
		input.style.height = height;
	}

	// When the User submits a message
	//
	async function onChatInput(e: KeyboardEvent) {
		if (e.key == 'Enter') {
			e.preventDefault();
			await send();
			return false;
		}
	}

	// Dispatch a message to the LLM.
	//
	async function send() {
		const content = input.value;

		loading = true;

		// Clear input
		input.value = '';
		resize();

		// Send to LLM
		await dispatch(session, model, content);

		loading = false;
	}

	$effect(() => {
		input.focus();
	});

	onMount(async () => {
		resize();
		scrollToBottom(content);
	});
</script>

<Flex class="h-content w-full flex-col p-8 pb-0">
	<!-- Chat Log -->
	<div
		bind:this={content}
		class:opacity-25={!Model.exists(model)}
		class="bg-medium relative mb-8 h-full w-full overflow-auto px-2"
	>
		{#each messages as message (message.id)}
			<Flex class="w-full flex-col items-start">
				<!-- Svelte hack: ensure chat is always scrolled to the bottom when a new message is added -->
				<div use:scrollToBottom class="hidden"></div>
				<Message {message} />
			</Flex>
		{/each}

		{#if loading}
			<Flex class="border-light h-12 w-24 rounded-lg text-center">
				<div id="loading" class="m-auto"></div>
			</Flex>
		{/if}
	</div>

	<!-- Input Box -->
	<textarea
		rows="1"
		autocomplete="off"
		autocorrect="off"
		bind:this={input}
		oninput={resize}
		onkeydown={onChatInput}
		disabled={!Model.exists(model)}
		placeholder="Message..."
		class="disabled:text-dark item bg-dark border-light focus:border-purple/15
        mb-8 h-auto w-full grow rounded-xl border p-3 pl-4 outline-0 transition duration-300"
	></textarea>
</Flex>

<style>
	#loading {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: #fff;
		box-shadow:
			16px 0 #fff,
			-16px 0 #fff;
		position: relative;
		animation: flash 1s ease-out infinite alternate;
	}

	@keyframes flash {
		0% {
			background-color: #fff2;
			box-shadow:
				16px 0 #fff2,
				-16px 0 #fff;
		}
		50% {
			background-color: #fff;
			box-shadow:
				16px 0 #fff2,
				-16px 0 #fff2;
		}
		100% {
			background-color: #fff2;
			box-shadow:
				16px 0 #fff,
				-16px 0 #fff2;
		}
	}
</style>
