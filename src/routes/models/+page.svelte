<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	import Box from '$components/Box.svelte';
	import Flex from '$components/Flex.svelte';
	import Layout from '$components/Layouts/Default.svelte';
	import Model, { type IModel } from '$lib/models/model.svelte';

	const models: IModel[] = Model.all().sortBy('name');
</script>

{#snippet titlebar()}
	<Flex class=" h-full w-[300px] items-center px-8 pr-4">
		<h1 class="font-[500]">Models</h1>
	</Flex>
{/snippet}

{#snippet label(text: string, css: string)}
	<p
		class={twMerge(
			css,
			'mx-1 rounded-xs px-1 py-0 text-[10px] leading-[16px] text-[#000] uppercase'
		)}
	>
		{text}
	</p>
{/snippet}

<Layout {titlebar}>
	<Flex class="w-full flex-col gap-2 p-8">
		{#each models as model (model.name)}
			<Box class="border-b-light text-light w-full border-b px-8 py-4">
				<h2 class="mr-2">{model.name}</h2>
				<div class="grow"></div>
				{@render label(model.details.format, 'bg-[#7aa2f7]')}
				{@render label(model.details.parameter_size, 'bg-[#ff9e64]')}
				{@render label(model.details.quantization_level, 'bg-[#41a6b5]')}
			</Box>
		{/each}
	</Flex>
</Layout>
