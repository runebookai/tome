<!-- App-wide event handlers -->
<script lang="ts">
	import closables from '$lib/closables';
	import { resync } from '$lib/models';

	const { children } = $props();

	function onclick(e: Event) {
		closables.close(e);
	}

	function onkeypress(e: KeyboardEvent) {
		if (e.key == 'Escape') {
			closables.close(e);
		}
	}

	async function onkeydown(e: KeyboardEvent) {
		// manually reload data from database
		if (e.metaKey && e.key == 'r') {
			await resync();
		}
	}
</script>

<svelte:window {onclick} {onkeypress} {onkeydown} />

{@render children?.()}
