<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { twMerge } from 'tailwind-merge';

	import closables from '$lib/closables';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		close: () => void | Promise<void>;
	}

	const { children, close, class: cls = '' }: Props = $props();
	let ref: HTMLDivElement;

	$effect(() => {
		closables.register(ref, close);
		return () => closables.unregister(ref);
	});
</script>

<div class="fixed top-0 left-0 z-40 h-screen w-screen bg-black/90"></div>

<div
	bind:this={ref}
	class={twMerge(
		'border-light bg-dark fixed top-[50%] left-[50%] z-50 max-h-3/4 w-[400px] -translate-[50%] overflow-y-scroll rounded-xl border p-8',
		cls?.toString()
	)}
>
	{@render children?.()}
</div>
