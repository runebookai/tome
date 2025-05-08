<script lang="ts">
	import Flex from './Flex.svelte';

	const { children, ondelete } = $props();

	let open = $state(false);
	let width = $derived(open ? 'w-24' : 'w-0');

	function onwheel(e: WheelEvent) {
		if (e.deltaX < 0 && e.deltaY == 0) {
			open = true;
		} else if (e.deltaX > 0) {
			open = false;
		}
	}
</script>

<Flex {onwheel} class="h-full w-full">
	<div class="grow">
		{@render children?.()}
	</div>

	<button
		onclick={ondelete}
		class={`${width} bg-red transition-[width 1s linear]
        h-full justify-center overflow-hidden text-xs font-semibold 
        tracking-wider text-white uppercase duration-150 hover:cursor-pointer`}
	>
		Delete
	</button>
</Flex>
