<script lang="ts" generics="Item">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { twMerge } from 'tailwind-merge';

	import Flex from './Flex.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		items: Item[];
		itemView: Snippet<[Item]>;
		borderless?: boolean;
		title?: string;
		titleClass?: string;
	}

	const {
		items,
		itemView,
		class: cls = '',
		titleClass = '',
		borderless = false,
		title,
	}: Props = $props();

	let css = borderless ? '' : 'border-b-light border-b';
</script>

<Flex class={twMerge('w-full flex-col items-start', cls?.toString())}>
	{#if title}
		<p class={twMerge('text-medium text-sm', titleClass?.toString())}>
			{title}
		</p>
	{/if}

	{#each items as item, i (i)}
		<div class={twMerge('w-full', css)}>
			{@render itemView(item)}
		</div>
	{/each}
</Flex>
