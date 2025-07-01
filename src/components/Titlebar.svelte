<script lang="ts">
    import type { SvelteHTMLElements } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';

    const { children, class: cls }: SvelteHTMLElements['div'] = $props();
</script>

<Flex
    id="titlebar"
    data-tauri-drag-region
    class={twMerge('h-titlebar border-b-light bg-medium w-full border-b', cls?.toString())}
>
    {@render children?.()}
</Flex>
