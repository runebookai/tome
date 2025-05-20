<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		name: string;
	}

	const { name, ...rest }: Props = $props();
</script>

{#await import(`$components/Icons/${name}.svelte`) then Module}
	<p {...rest}>
		<Module.default />
	</p>
{/await}
