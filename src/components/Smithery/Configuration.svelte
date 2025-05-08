<script lang="ts">
	import Button from '$components/Button.svelte';
	import Flex from '$components/Flex.svelte';
	import Input from '$components/Input.svelte';
	import Modal from '$components/Modal.svelte';
	import { info } from '$lib/logger';
	import type { McpConfig } from '$lib/mcp';
	import type { Config, ConfigSchema, Server } from '$lib/smithery';

	interface Props {
		server: Server;
		config: ConfigSchema;
		onCancel: () => void | Promise<void>;
		onInstall: (config: McpConfig) => void | Promise<void>;
	}

	const { server, config: _config, onCancel, onInstall }: Props = $props();

	let config: Config[] = $state(generateConfig(_config));
	let srcdoc: string = $state('');
	let optionalIsOpen = $state(false);

	function generateSrcdoc(server: Server, config: Config[]) {
		const { connections } = server;
		const fn = connections.findBy('type', 'stdio')?.stdioFunction || '() => ({})';

		return `<script>
	        const fn = ${fn};
	        const config = fn(${serialize(config)});
	        const message = { type: 'SmitheryInstall', config: config };
	        window.parent.postMessage(message, '*');
	    <\/script>`; // eslint-disable-line
	}

	// Transform a raw JSONSchema object from Smithery into a simpler object we
	// can use in the UI.
	//
	function generateConfig(config: ConfigSchema): Config[] {
		if (!config.properties || Object.keys(config.properties).length == 0) {
			return [];
		}

		return Object.entries(config.properties)
			.sort(([key, _]) => (config.required.includes(key) ? -1 : 1))
			.map(([key, prop]) => ({
				name: key,
				required: config.required?.includes(key),
				description: prop.description,
				value: String(prop.default || ''),
				valid: true,
			}));
	}

	function install() {
		validateAll();

		if (isValid()) {
			srcdoc = generateSrcdoc(server, config);
		}
	}

	function isValid() {
		return config.every((prop) => prop.valid);
	}

	function validateAll() {
		config
			.filter((c) => c.required)
			.forEach((prop) => {
				prop.valid = validate(prop.value);
			});
	}

	function validate(value: string): boolean {
		return value !== '';
	}

	// JSON representation of the object we pass to the Smithery configuration
	// function.
	//
	function serialize(config: Config[]) {
		return JSON.stringify(convert(config));
	}

	// Convert a `Config` to a plain `{key: value}` we can pass to the Smithery
	// configuration function.
	//
	function convert(config: Config[]) {
		const entries = config.map(({ name, value }) => [name, value]);
		return Object.fromEntries(entries);
	}

	function toggleOptional() {
		optionalIsOpen = optionalIsOpen ? false : true;
	}

	// Event handler for when the Smithery config function is ran inside the
	// iFrame.
	//
	// The only way to communicate up the chain, from an iframe, is via
	// messages. The iframe does this once it figures out the config.
	//
	async function onMessage(event: MessageEvent) {
		info(event);
		const config = event.data;

		if (config.type !== 'SmitheryInstall') {
			return;
		}

		await onInstall(event.data.config);
	}
</script>

<svelte:window onmessage={onMessage} />

{#if srcdoc}
	<iframe title="stdioFunction" class="hidden h-0 w-0" sandbox="allow-scripts" allow="" {srcdoc}>
	</iframe>
{/if}

{#if server && config}
	<Modal close={onCancel} class="!p-0 !pb-8">
		<Flex class="w-full flex-col items-start">
			<h2 class="p-8 py-4">{server.displayName}</h2>

			{#if config.length > 0}
				<div class="w-full px-8">
					{#each config.filter((p) => p.required) as prop (prop.name)}
						<Input
							label={prop.name}
							name={prop.name}
							bind:value={prop.value}
							required={prop.required}
							{validate}
						/>
					{/each}
				</div>

				{#if config.some((p) => !p.required)}
					<Flex class="mt-8 w-full flex-col items-start">
						<button
							onclick={() => toggleOptional()}
							class="text-medium text-sm-full w-full px-8 pb-2 text-left hover:cursor-pointer"
						>
							{optionalIsOpen ? '⏷' : '⏵'} &nbsp; Optional
						</button>

						{#if optionalIsOpen}
							<div class="w-full px-8">
								{#each config.filter((p) => !p.required) as prop (prop.name)}
									<Input
										label={prop.name}
										name={prop.name}
										bind:value={prop.value}
									/>
								{/each}
							</div>
						{/if}
					</Flex>
				{/if}
			{/if}

			<Flex class="mt-8 mr-8 self-end">
				<Button onclick={onCancel} class="border-medium text-medium mr-4">Cancel</Button>
				<Button onclick={install} class="border-purple text-purple">Install</Button>
			</Flex>
		</Flex>
	</Modal>
{/if}
