<script lang="ts">
    import { onMount } from 'svelte';

    import Flex from '$components/Flex.svelte';
    import type { IMessage } from '$lib/models/message';

    interface Props {
        message: IMessage;
    }

    const MAX_HEIGHT_PER_LINE = 28;
    const { message }: Props = $props();

    let rounded = $state('rounded-full');
    let ref: HTMLDivElement;

    onMount(() => {
        if (ref?.clientHeight > MAX_HEIGHT_PER_LINE) {
            rounded = 'rounded-2xl';
        }
    });
</script>

<Flex class={`bg-light self-end ${rounded} mb-8 px-8 py-3 whitespace-pre`}>
    <div bind:this={ref}>{message.content}</div>
</Flex>
