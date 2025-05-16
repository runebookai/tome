<script lang="ts">
	import Flex from '$components/Flex.svelte';
	import type { IEngine } from '$lib/models/engine';
	import Model, { type IModel } from '$lib/models/model';

	interface Props {
		engines: IEngine[];
		value: string;
		onselect?: (model: IModel) => Promise<void>;
	}

	let { engines, onselect, value = $bindable() }: Props = $props();
	let isOpen = $state(false);

	const model = $derived(Model.find(value));

	async function select(m: IModel) {
		close();
		value = m.name;
		await onselect?.(m);
	}

	function toggle(e: Event) {
		e.stopPropagation();
		isOpen = isOpen ? false : true;
	}

	function close() {
		isOpen = false;
	}
</script>

<Flex class="bg-medium relative h-16 w-full hover:cursor-pointer">
	<Flex
		onclick={(e) => toggle(e)}
		class="border-light absolute top-0 left-0 w-full justify-between
        rounded-md border p-2 px-4"
	>
		<p>{model?.name}</p>
		<p>⏷</p>
	</Flex>

	{#if isOpen}
		<Flex
			class="border-light bg-medium absolute top-12 left-0 z-50 -mt-[1px]
            max-h-[calc(100vh*0.7)] w-full flex-col items-start overflow-y-auto rounded-md
            rounded-t-none border"
		>
			{#each engines as engine (engine.id)}
				<p class="text-medium px-4 pt-4 pb-2 text-sm font-[500] uppercase">
					{engine.name}
				</p>

				<div>
					{#each engine.models as model (model.id)}
						<button
							onclick={async () => await select(model)}
							class="border-light w-full border-b p-2 px-4 pl-8 text-left
                            first:border-t last:border-b-0 hover:cursor-pointer"
						>
							{model.name}
						</button>
					{/each}
				</div>
			{/each}
		</Flex>
	{/if}
</Flex>
