<script lang="ts">
	import Box from '$components/Box.svelte';
	import Flex from '$components/Flex.svelte';
	import Layout from '$components/Layouts/Default.svelte';
	import Svg from '$components/Svg.svelte';
	import Titlebar from '$components/Titlebar.svelte';
	import Setting, { type ISetting } from '$lib/models/setting';

	const settings: ISetting[] = $derived(Setting.all());

	let saving = $state(false);

	async function save(setting: ISetting) {
		saving = true;
		await Setting.save(setting);
		setTimeout(() => (saving = false), 1000);
	}
</script>

{#snippet titlebar()}
	<Titlebar class="h-[60px] w-full">
		<Flex class="h-full px-8 pr-4">
			<h1 class="font-[500]">Settings</h1>
			<div class={`text-green mt-[2px] ml-4 h-4 w-4 ${saving ? 'opacity-100' : 'opacity-0'}`}>
				<Svg name="Check" />
			</div>
		</Flex>
	</Titlebar>
{/snippet}

<Layout {titlebar}>
	<Flex class="w-full flex-col gap-4 p-8">
		{#each settings as setting (setting.id)}
			<Box class="mt-4 w-full flex-col items-start">
				<label for={setting.key} class="text-light/80 -mt-8 ml-3">
					{setting.display}
				</label>

				<input
					type={setting.type}
					class="border-light bg-medium text-light mt-2 w-full
                    rounded-md border p-2 px-4 outline-none"
					name={setting.key}
					bind:value={setting.value}
					onchange={() => save(setting)}
				/>
			</Box>
		{/each}
	</Flex>
</Layout>
