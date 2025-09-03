<script lang="ts">
    import hljs from 'highlight.js';
    import type { HTMLAttributes } from 'svelte/elements';

    import Flex from '$components/Flex.svelte';
    import Icon from '$components/Icon.svelte';
    import type { SerializedApp } from '$lib/apps';
    import { App } from '$lib/models';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        app: App;
        serializedApp: SerializedApp;
    }

    const { serializedApp }: Props = $props();

    function link() {
        const json = JSON.stringify(serializedApp);
        const hash = encodeURIComponent(json);
        return `tome://apps/import?app=${hash}`;
    }

    function highlighted() {
        return hljs.highlight(JSON.stringify(serializedApp, null, 4), {
            language: 'json',
        }).value;
    }

    async function copyLink() {
        await navigator.clipboard.writeText(link());
    }

    async function copyJson() {
        await navigator.clipboard.writeText(JSON.stringify(serializedApp, null, 4));
    }
</script>

<Flex class="h-full w-full flex-0 flex-col items-start p-4">
    <h1 class="m-2">Import Link</h1>

    <Flex class="border-light w-full rounded-md border p-2">
        <p class="text-medium mr-4 w-[94%] overflow-x-scroll font-mono">
            {link()}
        </p>

        <button onclick={copyLink} class="border-light -mt-3 rounded-sm border p-2">
            <Icon name="Copy" />
        </button>
    </Flex>

    <h1 class="m-2">JSON</h1>

    <Flex class="relative w-full shrink flex-col items-start overflow-scroll">
        <button onclick={copyJson} class="absolute top-2 right-2 p-2">
            <Icon name="Copy" />
        </button>

        <pre
            class="border-light min-h-0 w-full overflow-scroll rounded-md border p-2"><code>{@html highlighted()}</code></pre>
    </Flex>
</Flex>
