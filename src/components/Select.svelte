<script lang="ts">
	import { onMount } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { twMerge } from 'tailwind-merge';

	import Flex from '$components/Flex.svelte';
	import closables from '$lib/closables';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		options: string[];
		value?: string;
		onSelect: () => Promise<void>;
	}

	let { options, value = $bindable(), onSelect, class: cls = '' }: Props = $props();
	let isOpen = $state(false);
	let ref: ReturnType<typeof Flex>;

	function toggle(e: Event) {
		isOpen = isOpen ? false : true;
		e.stopPropagation();
	}

	async function select(option: string) {
		close();
		value = option;
		await onSelect();
	}

	function close() {
		isOpen = false;
	}

	onMount(() => {
		closables.register(ref, close);
	});
</script>

<Flex
	bind:this={ref}
	class={twMerge('bg-medium relative h-10 w-32 hover:cursor-pointer', cls?.toString())}
>
	<Flex
		onclick={(e) => toggle(e)}
		class={`border-light absolute top-0 left-0 w-full justify-between rounded-md border p-2 px-4 ${isOpen ? 'rounded-b-none' : ''}`}
	>
		<p>{value}</p>
		<p>▾</p>
	</Flex>

	{#if isOpen}
		<Flex
			class="border-light bg-medium absolute top-12 left-0 z-50 mt-[1px]
            w-full flex-col items-start rounded-md rounded-t-none border"
		>
			{#each options as option (option)}
				<button
					onclick={async () => await select(option)}
					class="bg-dark border-b-light w-full border-b p-2 px-4 text-left last:border-b-0 hover:cursor-pointer"
				>
					{option}
				</button>
			{/each}
		</Flex>
	{/if}
</Flex>
