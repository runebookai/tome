<script lang="ts">
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';

    const { children, class: cls = '' } = $props();
</script>

<Flex
    class={twMerge(
        'border-light mb-4 w-full flex-col items-start rounded-md border p-0',
        cls?.toString()
    )}
>
    {@render children?.()}
</Flex>
