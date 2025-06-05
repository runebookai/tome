<script lang="ts">
    import Flex from '$components/Flex.svelte';
    import Thought from '$components/Messages/Thought.svelte';
    import markdown from '$lib/markdown';
    import { Message } from '$lib/models';

    interface Props {
        message: Message;
    }

    const { message }: Props = $props();
</script>

{#if message.thought}
    <Thought thought={message.thought} />
{/if}

<Flex class="assistant text-medium mb-8 w-full justify-between p-2 text-xs">
    <p class="message markdown-body w-full text-sm whitespace-normal">
        {@html markdown.render(message.content)}
    </p>
</Flex>
