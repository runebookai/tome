<script lang="ts">
	const { name, class: cls = '' } = $props();
</script>

{#await import(`$components/Icons/${name}.svelte`) then Module}
	<p class={cls}>
		<Module.default />
	</p>
{/await}
