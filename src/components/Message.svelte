<script lang="ts">
    import Assistant from '$components/Messages/Assistant.svelte';
    import Tool from '$components/Messages/Tool.svelte';
    import User from '$components/Messages/User.svelte';
    import { Message } from '$lib/models';

    interface Props {
        message: Message;
    }

    const { message }: Props = $props();
</script>

{#if message.role == 'user'}
    <User {message} />
{:else if message.role == 'assistant' && message.content === '' && message.toolCalls.length}
    <Tool {message} />
{:else if message.role == 'assistant'}
    <Assistant {message} />
{/if}
