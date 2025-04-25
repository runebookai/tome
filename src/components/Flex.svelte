<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';
	import { twMerge } from 'tailwind-merge';

	const { children, class: cls, ...rest }: SvelteHTMLElements['div'] = $props();
</script>

<div class={twMerge('flex flex-row items-center', cls?.toString())} {...rest}>
	{@render children?.()}
</div>
