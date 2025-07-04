<script lang="ts">
    import { onMount } from 'svelte';

    import Flex from '$components/Flex.svelte';
    import MessageView from '$components/Message.svelte';
    import Scrollable from '$components/Scrollable.svelte';
    import { dispatch } from '$lib/dispatch';
    import { Message, Model, Session } from '$lib/models';

    interface Props {
        session: Session;
        model?: Model;
        onMessages?: (message: Message[]) => Promise<void>;
    }

    const { session, model }: Props = $props();

    // DOM elements used via `bind:this`
    let input: HTMLTextAreaElement;

    // svelte-ignore non_reactive_update
    let content: HTMLDivElement;

    // Full history of chat messages in this session
    const messages: Message[] = $derived(session.messages);

    // Is the LLM processing (when true, we show the ellipsis)
    let loading = $state(false);

    // Scroll the chat history box to the bottom
    //
    function scrollToBottom(_: HTMLElement) {
        if (content) {
            // Scroll to the maximum integer JS can handle, to ensure we're at the
            // bottom. `scrollHeight` doesn't work here for some mysterious reason.
            // ¯\_(ツ)_/¯
            content.scroll({ top: 9e15 });
        }
    }

    function resize() {
        const min = 56; // Default height of the input
        const scrollHeight = input.scrollHeight;
        const padding = scrollHeight > min ? 6 : 0;
        const scroll = Math.max(56, input.scrollHeight) + padding;
        const height = /^\s*$/.test(input.value) ? '56px' : `${scroll}px`;
        input.style.height = '0px';
        input.style.height = height;
    }

    // When the User submits a message
    //
    async function onChatInput(e: KeyboardEvent) {
        if (e.key == 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await send();
            return false;
        }
    }

    // Dispatch a message to the LLM.
    //
    async function send() {
        const content = input.value;

        if (!model) {
            return;
        }

        loading = true;

        // Clear input
        input.value = '';
        resize();

        // Send to LLM
        await dispatch(session, model, content);

        loading = false;
    }

    $effect(() => {
        input.focus();
    });

    onMount(async () => {
        resize();
        scrollToBottom(content);
    });
</script>

<Flex class="h-content w-full flex-col p-8 pr-2 pb-0">
    <Scrollable bind:ref={content} class="mb-8 pr-6">
        <!-- Chat Log -->
        <div class:opacity-25={!model} class="bg-medium relative w-full">
            {#each messages as message (message.id)}
                <Flex id="messages" class="w-full flex-col items-start">
                    <!-- Svelte hack: ensure chat is always scrolled to the bottom when a new message is added -->
                    <div use:scrollToBottom class="hidden"></div>
                    <MessageView {message} />
                </Flex>
            {/each}

            {#if loading}
                <Flex class="border-light h-12 w-24 rounded-lg text-center">
                    <div id="loading" class="m-auto"></div>
                </Flex>
            {/if}
        </div>
    </Scrollable>

    <!-- Input Box -->
    <textarea
        rows="1"
        autocomplete="off"
        autocorrect="off"
        bind:this={input}
        oninput={resize}
        onkeydown={onChatInput}
        disabled={!model}
        placeholder="Message..."
        class="disabled:text-dark item bg-medium border-light focus:border-purple/15 mb-8
        h-auto w-[calc(100%-calc(var(--spacing)*6))] grow self-start rounded-xl border
        p-3 pl-4 outline-0 transition duration-300"
    ></textarea>
</Flex>

<style>
    #loading {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #fff;
        box-shadow:
            16px 0 #fff,
            -16px 0 #fff;
        position: relative;
        animation: flash 1s ease-out infinite alternate;
    }

    @keyframes flash {
        0% {
            background-color: #fff2;
            box-shadow:
                16px 0 #fff2,
                -16px 0 #fff;
        }
        50% {
            background-color: #fff;
            box-shadow:
                16px 0 #fff2,
                -16px 0 #fff2;
        }
        100% {
            background-color: #fff2;
            box-shadow:
                16px 0 #fff,
                -16px 0 #fff2;
        }
    }
</style>
