<script lang="ts">
    import { onMount } from 'svelte';

    import Flex from '$components/Flex.svelte';
    import markdown from '$lib/markdown';
    import { Message } from '$lib/models';

    interface Props {
        message: Message;
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

<Flex class={`bg-light self-end ${rounded} mb-8 px-8 py-3 whitespace-pre-wrap`}>
    <p
        bind:this={ref}
        class="message user-message markdown-body w-full rounded-sm text-sm whitespace-normal"
    >
        {@html markdown.render(message.content)}
    </p>
</Flex>
