<script lang="ts">
	// App-wide event handlers

	import closables from '$lib/closables';

	const { children } = $props();

	async function onWindowClick(e: Event) {
		closables.close(e);
	}
</script>

<svelte:window onclick={(e) => onWindowClick(e)} />

{@render children?.()}
