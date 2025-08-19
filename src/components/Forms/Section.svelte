<script lang="ts">
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';

    const { children, class: cls = '' } = $props();
</script>

<Flex class={twMerge('border-b-light w-full items-start border-b p-4', cls?.toString())}>
    {@render children?.()}
</Flex>
