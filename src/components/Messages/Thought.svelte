<script lang="ts">
	import Svg from '$components/Svg.svelte';

	const { thought } = $props();

	let isOpen = $state(false);
	const rounded = $derived.by(() => (isOpen ? 'rounded-xl' : 'rounded-full'));

	function toggle() {
		isOpen = isOpen ? false : true;
	}
</script>

<thought class={`text-medium border-light mb-4 ${rounded} border pr-2`}>
	<button
		onclick={() => toggle()}
		class="flex w-full items-center gap-4 p-2 px-4 hover:cursor-pointer"
	>
		<Svg name="Lightbulb" class="h-6 w-6" />
		Model Thoughts
	</button>

	{#if isOpen}
		<p class="p-4 px-6 whitespace-pre-wrap">
			{thought}
		</p>
	{/if}
</thought>
