<script lang="ts">
	import { WELCOME_AGREED } from '$lib/const';
	import Flex from '$components/Flex.svelte';
	import Config from '$lib/config';

	async function accept() {
		await Config.set(WELCOME_AGREED, true);
	}
</script>

<Flex
	class="border-light absolute top-[50%] left-[50%] w-[calc(100vw*0.5)]
    -translate-[50%] items-start rounded-3xl border p-12"
>
	<img class="mr-12 h-48 w-48" src="/images/tome.png" alt="tome" />

	<Flex class="flex-col items-start gap-4">
		<h1 class="text-purple text-3xl">Welcome to Tome</h1>
		<p>
			Thanks for being an early adopter! We appreciate you kicking the tires of our
			<strong>Technical Preview</strong> as we explore making local LLMs, MCP, and AI app composition
			a better experience.
		</p>
		<p>
			This is an extremely early build. There will be problems – edges are rough – features
			are lacking – we know 🙂 Let us know what you're running into and what you'd like to
			see.
		</p>
		<button
			onclick={() => accept()}
			class="from-purple-dark to-purple mt-2 rounded-md bg-linear-to-t p-1 px-4 hover:cursor-pointer"
		>
			Sounds good, let's go!
		</button>
	</Flex>
</Flex>
