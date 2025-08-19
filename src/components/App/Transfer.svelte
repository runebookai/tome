<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { goto } from '$app/navigation';

    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
    import Modal from '$components/Modal.svelte';
    import Svg from '$components/Svg.svelte';
    import { App } from '$lib/models';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        app: App;
        submitText: string;
        onsubmit: (e: Event) => Promise<unknown> | unknown;
    }

    const { app, submitText, onsubmit: _onsubmit, children }: Props = $props();

    function cancel() {
        goto(`/apps/${app.id}`);
    }

    async function onsubmit(e: Event) {
        await _onsubmit?.(e);
    }
</script>

<Modal close={cancel} class="h-3/4 w-2/5 p-0">
    <Flex class="h-full flex-col items-start">
        <Flex class="text-light border-light mb-0 flex-0 flex-row border-b px-4 py-4">
            <Svg name="Apps" class="mr-4 h-12 w-12" />
            <Flex class="flex-col items-start">
                <h1 class="text-2xl">{app.name}</h1>
                <p class="text-medium text-sm">{app.description}</p>
            </Flex>
        </Flex>

        <Flex class="min-h-0 flex-1 flex-col overflow-auto p-4 pt-0">
            {@render children?.()}
        </Flex>

        <Flex class="border-light w-full flex-0 border-t p-4">
            <Button
                onclick={onsubmit}
                class="border-purple text-dark bg-purple w-full font-bold uppercase"
            >
                {submitText}
            </Button>
        </Flex>
    </Flex>
</Modal>
