<script lang="ts">
    import hljs from 'highlight.js';

    import Flex from '$components/Flex.svelte';
    import Svg from '$components/Svg.svelte';
    import markdown from '$lib/markdown';
    import Message, { type IMessage } from '$lib/models/message';

    interface Props {
        message: IMessage;
    }

    const { message }: Props = $props();
    const response = $derived(Message.response(message) as IMessage);

    let isOpen = $state(false);
    let css = $derived.by(() => (isOpen ? 'rounded-xl w-full' : 'rounded-full'));

    function toggle() {
        isOpen = isOpen ? false : true;
    }

    function format(response: IMessage) {
        try {
            // Re-format JSON to be more readable
            const json = JSON.parse(response.content);
            const str = JSON.stringify(json, null, 4);
            return '```json\n' + str + '\n```';
        } catch {
            // Response wasn't JSON, just display it as is.
            return response.content;
        }
    }
</script>

{#each message.toolCalls as call, i (i)}
    {@const args = hljs.highlight(JSON.stringify(call.function.arguments, null, 4), {
        language: 'json',
    }).value}

    <Flex class={`border-light flex-col items-start ${css} mb-4 border p-2 px-3`}>
        <Flex onclick={toggle} class="hover:cursor-pointer">
            <Svg name="MCP" class="text-dark h-4 w-4" />

            <Flex class="gap-2">
                <p class="flex items-center px-3 py-1 text-sm">
                    <span class="text-yellow mr-4">{call.function.name}</span>

                    {#each Object.entries(call.function.arguments) as [name, value] (name)}
                        <span class="text-medium mr-1">{name}:</span>
                        <span class="text-light mr-4">{String(value).ellipsize()}</span>
                    {/each}
                </p>
            </Flex>
        </Flex>

        {#if isOpen}
            <h3
                class="text-medium border-light mt-4 w-full
                rounded-t-md border border-b-0 p-2 px-4 text-xs uppercase"
            >
                Arguments
            </h3>

            <div class="border-light w-full overflow-x-scroll rounded-b-md border p-2 px-4">
                <!--
                This MUST be formatted on one line, because HTML is dumb.
                Otherwise, it renders leading and trailing space, on the first and last line of
                the block.
                -->
                <pre><code class="text-sm">{@html args}</code></pre>
            </div>

            <h3
                class="text-medium border-light mt-4 w-full
                rounded-t-md border border-b-0 p-2 px-4 text-xs uppercase"
            >
                Response
            </h3>

            <div
                class="border-light mb-1 w-full overflow-x-scroll rounded-b-md border p-2
                px-4 whitespace-pre"
            >
                {@html markdown.render(format(response))}
            </div>
        {/if}
    </Flex>
{/each}
