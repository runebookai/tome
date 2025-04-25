<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';
	import { twMerge } from 'tailwind-merge';
	import { page } from '$app/state';

	type Props = SvelteHTMLElements['a'] & {
		href: string;
		prefix?: string;
		activeClass?: string;
	};

	const { children, class: cls = '', href, prefix, activeClass, ...rest }: Props = $props();

	const path = page.url.pathname;
	const isActive = path == href || (prefix && path.startsWith(prefix));
</script>

<a
	{...rest}
	{href}
	class={twMerge('border-l border-transparent', cls?.toString(), isActive ? activeClass : '')}
>
	{@render children?.()}
</a>

<style>
	a {
		transition: all 0.3s linear;
	}
</style>
