<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { goto } from '$app/navigation';

    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
    import Icon from '$components/Icon.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Modal from '$components/Modal.svelte';
    import Svg from '$components/Svg.svelte';
    import { Engine } from '$lib/models';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        engine: Engine;
        disabled: boolean;
    }

    const { children, engine, disabled }: Props = $props();

    let error = $state(false);

    async function connect() {
        error = false;

        if (await engine.client?.connected()) {
            await engine.save();
            await goto('/onboarding/mcp');
        } else {
            error = true;
        }
    }

    async function close() {
        await goto('/onboarding');
    }
</script>

<Layout>
    <Modal class="border-light border p-0">
        <Flex class="bg-dark border-light w-full flex-0 border-b p-3 pl-6">
            <Flex class="w-full">
                <Icon name="Openai" class="mr-4 h-4 w-4" />
                <p>Setup {engine.displayName}</p>
            </Flex>

            <button onclick={close} class="border-light text-medium rounded-sm border p-2">
                <Svg name="X" class="h-2 w-2" />
            </button>
        </Flex>

        <Flex
            class="bg-medium border-light m-4 flex-col items-center
            rounded-md border"
        >
            {@render children?.()}
        </Flex>

        {#if error}
            <Flex class="mb-4 w-full justify-center">
                <p class="text-red text-sm">Connection Error</p>
            </Flex>
        {/if}

        <Flex
            class="bg-dark border-light w-full flex-0 justify-center rounded-b-xl
            border-t p-4"
        >
            <Button
                {disabled}
                onclick={connect}
                class="bg-purple text-dark w-full border-none text-xs font-semibold
                uppercase disabled:opacity-25"
            >
                Continue
            </Button>
        </Flex>
    </Modal>
</Layout>
