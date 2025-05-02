<script lang="ts">
	import { constantCase } from 'change-case';

	import Flex from '$components/Flex.svelte';
	import Input from '$components/Input.svelte';
	import Svg from '$components/Svg.svelte';
	import McpServer, { type IMcpServer } from '$lib/models/mcp-server';

	interface Props {
		server: IMcpServer;
	}

	interface Env {
		key: string;
		value: string;
	}

	let { server }: Props = $props();

	let command: string = $state('');
	let env: Env[] = $state([]);

	let newKey: string = $state('');
	let newValue: string = $state('');

	// Derive the computed `command` and mutable `env` from `server`. Must
	// happen before the UI renders (via `$effect.raw`) so that we use the most
	// recently set `server`.
	$effect.pre(() => {
		command = `${server.command} ${server.args.join(' ')}`.trim();
		env = Object.entries(server.env).map(([key, value]) => ({
			key: constantCase(key),
			value,
		}));
	});

	async function save() {
		const cmd = command.split(' ');
		server.command = cmd[0];
		server.args = cmd.slice(1);
		server.env = Object.fromEntries(env.map((e) => [constantCase(e.key), e.value]));
		server = await McpServer.save(server);
	}

	async function addEnv() {
		env.push({ key: newKey, value: newValue });
		await save();

		newKey = '';
		newValue = '';
	}

	async function remove(key: string) {
		env = env.filter((e) => e.key !== key);
		await save();
	}
</script>

<Flex class="w-full flex-col items-start">
	<h1 class="text-purple mb-4 ml-4 text-2xl">{server.name}</h1>

	<h2 class="text-medium mt-8 mb-4 ml-4 text-xl">Command</h2>
	<Input
		bind:value={command}
		label={false}
		name="command"
		class="w-full"
		onchange={save}
		placeholder="uvx | npx COMMAND [args]"
	/>

	<h2 class="text-medium mt-8 mb-4 ml-4 text-xl">Env</h2>
	<Flex class="grid w-full auto-cols-max auto-rows-max grid-cols-2 gap-4">
		{#each env as entry (entry.key)}
			<Input
				onchange={save}
				label={false}
				placeholder="Key"
				bind:value={entry.key}
				class="uppercase"
			/>

			<Flex>
				<Input onchange={save} label={false} placeholder="Value" bind:value={entry.value} />
				<button
					class="text-dark hover:text-red ml-4 transition duration-300 hover:cursor-pointer"
					onclick={() => remove(entry.key)}
				>
					<Svg name="Delete" class="h-4 w-4" />
				</button>
			</Flex>
		{/each}

		<Input bind:value={newKey} label={false} placeholder="Key" class="uppercase" />

		<Flex>
			<Input bind:value={newValue} onchange={addEnv} label={false} placeholder="Value" />
			<div class="ml-4 h-4 w-4"></div>
		</Flex>
	</Flex>
</Flex>
