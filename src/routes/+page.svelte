<script lang="ts">
	import { goto } from '$app/navigation';

	import Layout from '$components/Layouts/Default.svelte';
	import Svg from '$components/Svg.svelte';
	import Welcome from '$components/Welcome.svelte';
	import startup, { type Condition, type OnSuccess, StartupCheck } from '$lib/startup';

	const messages = {
		[StartupCheck.Ollama]: 'Cannot connect to Ollama',
		[StartupCheck.MissingModels]: 'Ollama has no models',
		[StartupCheck.Agreement]: 'Non Agreement',
	};

	let checks = $state(startup.checks);
	let check = $derived(checks[0]);
	let message: string = $state('');
	let condition: Condition;
	let onSuccess: OnSuccess | undefined;
	let int = $state(0);

	async function checkCondition() {
		if (await condition()) {
			clearInterval(int);
			onSuccess?.();
			checks = checks.slice(1);
		} else {
			message = messages[checks[0][0]];
			clearInterval(int);
			// LSP sometimes thinks this is the Node.js `setInterval`, which
			// returns a `Timeout` object, whereas the browser version returns
			// a `number`. I don't know why.
			int = setInterval(checkCondition, 500) as unknown as number;
		}
	}

	$effect(() => {
		if (checks.length == 0) {
			clearInterval(int);
			goto('/chat/latest');
			return;
		}

		condition = checks[0][1];
		onSuccess = checks[0][2];
		checkCondition();
	});
</script>

<div class="absolute top-0 left-0 z-10 h-full w-full bg-black/70"></div>

<div class="absolute top-[50%] left-[50%] z-50 flex -translate-[50%] flex-col items-center gap-4">
	{#if check && check[0] == StartupCheck.Agreement}
		<Welcome />
	{:else if check}
		<h1 class="text-red flex items-center gap-4 text-2xl">
			<Svg class="h-6 w-6" name="Warning" />
			{message}
		</h1>

		<a href="/settings">Settings</a>
	{:else}
		<Svg name="Logo" class="text-dark h-48 w-48" />
	{/if}
</div>

<Layout></Layout>
