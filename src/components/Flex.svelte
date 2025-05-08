<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { twMerge } from 'tailwind-merge';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		ref?: HTMLDivElement;
	}

	let { children, ref = $bindable(), class: cls, ...rest }: Props = $props();
</script>

<div bind:this={ref} class={twMerge('flex flex-row items-center', cls?.toString())} {...rest}>
	{@render children?.()}
</div>
