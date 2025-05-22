<script lang="ts">
    import type { SvelteHTMLElements } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';

    const { children, class: cls = '', ...rest }: SvelteHTMLElements['div'] = $props();
</script>

<Flex class={twMerge('border-light mb-2 rounded-lg border p-4', cls?.toString())} {...rest}>
    {@render children?.()}
</Flex>
