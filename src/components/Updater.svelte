<script lang="ts">
	import { invoke } from '@tauri-apps/api/core';
	import { type Update } from '@tauri-apps/plugin-updater';

	import Button from '$components/Button.svelte';
	import Flex from '$components/Flex.svelte';
	import Modal from '$components/Modal.svelte';
	import Svg from '$components/Svg.svelte';
	import Config from '$lib/config';
	import { info } from '$lib/logger';
	import { Setting } from '$lib/models';
	import { AUTOMATIC_UPDATES } from '$lib/models/setting';
	import { availableUpdate } from '$lib/updates';

	let update: Update | null = $state(null);
	let totalDownload: number = $state(0);
	let downloaded: number = $state(0);
	let finished = $state(false);

	let width = 'w-0';

	const autoUpdate = $derived(Setting.findBy({ key: AUTOMATIC_UPDATES }));

	async function save() {
		await Setting.save(autoUpdate);
	}

	async function install() {
		update = await availableUpdate();

		await update?.downloadAndInstall((event) => {
			switch (event.event) {
				case 'Started':
					totalDownload = event.data.contentLength as number;
					break;

				case 'Progress':
					downloaded += event.data.chunkLength;
					break;

				case 'Finished':
					finished = true;
					update = null;
					break;
			}
		});
	}

	async function skip() {}

	async function restart() {
		await invoke('restart');
	}
</script>

<Modal class="w-[500px]" noclose>
	<Flex class="h-auto w-full items-start">
		<Svg name="Updates" class="mt-2 mr-8 h-12 w-12" />

		{#if update}
			<Flex class="w-full flex-col items-start">
				<h2 class="font-semibold">Installing Tome {update.version}</h2>
				<div class="bg-light mt-4 h-2 w-full rounded-full">
					<div class={`h-2 rounded-full bg-white/20 ${width}`}></div>
				</div>
				<p class="text-medium mt-2 text-xs">
					{downloaded} / {totalDownload}
				</p>
			</Flex>
		{:else if finished}
			<Flex class="w-full flex-col items-start">
				<h2 class="mt-4 font-semibold">Tome is updated</h2>
				<Button onclick={restart} class="border-purple text-purple mt-4 self-end">
					Restart
				</Button>
			</Flex>
		{:else}
			<Flex class="w-full flex-col items-start">
				<h2 class="font-semibold">Updates Available</h2>
				<p>A new Tome is ready to be installed</p>

				<Flex class="text-medium mt-4 text-sm">
					<input
						type="checkbox"
						onchange={save}
						bind:checked={autoUpdate.value}
						class="mr-3"
					/>
					<p>Automatically keep Tome up to date</p>
				</Flex>

				<Flex class="mt-8 gap-4 self-end">
					<Button class="border-light text-medium">Skip this version</Button>
					<Button onclick={install} class="border-purple text-purple">Install</Button>
				</Flex>
			</Flex>
		{/if}
	</Flex>
</Modal>
