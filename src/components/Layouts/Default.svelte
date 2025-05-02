<script lang="ts">
	import '../../app.css';

	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import Flex from '$components/Flex.svelte';
	import Nav from '$components/Nav.svelte';
	import Titlebar from '$components/Titlebar.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		titlebar?: Snippet;
	}

	const { titlebar, children }: Props = $props();
</script>

<div data-tauri-drag-region class="fixed top-0 left-0 h-8 w-full"></div>

<Flex class="relative h-screen w-screen items-start overflow-hidden">
	<Nav id="nav" class="w-nav fixed top-0 left-0 h-full" />

	<Flex id="content" class="w-content-minus-nav fixed top-0 left-[var(--width-nav)] flex-col">
		<Titlebar class="w-full">
			{@render titlebar?.()}
		</Titlebar>

		<section
			class="w-content-minus-nav fixed top-[var(--height-titlebar)] left-0 ml-[var(--width-nav)] h-full min-h-screen"
		>
			{@render children?.()}
		</section>
	</Flex>
</Flex>
