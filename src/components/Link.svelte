<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { twMerge } from 'tailwind-merge';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';

	type Props = HTMLAttributes<HTMLAnchorElement> & {
		href: string;
		prefix?: string;
		activeClass?: string;
	};

	const { children, class: cls = '', href, prefix, activeClass, ...rest }: Props = $props();

	let isActive = $state(false);

	afterNavigate(() => {
		const path = page.url.pathname;
		const prefixMatch = path.startsWith(`${href}/`);
		const explicitPrefixMatch = path.startsWith(prefix as string);
		const pathMatch = path == href;
		isActive = pathMatch || prefixMatch || explicitPrefixMatch;
	});
</script>

<a
	{...rest}
	{href}
	class={twMerge('block duration-300', cls?.toString(), isActive ? activeClass : '')}
	data-sveltekit-preload-data="off"
>
	{@render children?.()}
</a>
