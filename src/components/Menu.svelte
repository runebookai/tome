<script lang="ts" module>
	export interface MenuItem {
		icon: string;
		label: string;
		style?: string;
		onclick: () => void;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { SvelteHTMLElements } from 'svelte/elements';
	import { twMerge } from 'tailwind-merge';

	import Flex from '$components/Flex.svelte';
	import Svg from '$components/Svg.svelte';
	import closables from '$lib/closables';

	type Props = SvelteHTMLElements['div'] & {
		items: MenuItem[];
	};

	const { items, class: cls = '' }: Props = $props();

	let isOpen = $state(false);
	let ref: HTMLButtonElement;

	function toggle() {
		isOpen = isOpen ? false : true;
	}

	function close() {
		isOpen = false;
	}

	onMount(() => {
		closables.register(ref, close);
	});
</script>

<Flex class={twMerge('relative justify-center', cls?.toString())}>
	<button
		bind:this={ref}
		onclick={() => toggle()}
		class={`${isOpen ? 'bg-medium border-light z-30 border' : ''} border-light
        text-dark/75 z-10 h-8 w-10 rounded-t-md
        border-b-0 text-center text-[6px]
        leading-8 font-bold transition-none hover:cursor-pointer`}
	>
		•••
	</button>

	{#if isOpen}
		<Flex
			class="border-light bg-medium absolute top-[calc(--spacing(8)-1px)] right-0 
            z-20 min-w-56 flex-col rounded-md rounded-tr-none 
            border p-1 group-hover:block"
		>
			{#each items as item, i (i)}
				<button
					onclick={item.onclick}
					class={twMerge(
						'hover:bg-light/25 flex w-full flex-row items-start justify-between rounded-md p-3 py-2 hover:cursor-pointer',
						item.style
					)}
				>
					<div class="h-4 w-4">
						<Svg name={item.icon} />
					</div>
					<p>{item.label}</p>
				</button>
			{/each}
		</Flex>
	{/if}
</Flex>
