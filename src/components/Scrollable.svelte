<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        ref?: HTMLDivElement;
    }

    let { children, ref = $bindable(), class: cls = '' }: Props = $props();
</script>

<Flex bind:ref class={twMerge('h-content w-full items-start overflow-y-scroll', cls?.toString())}>
    <div class="w-full">
        {@render children?.()}
    </div>
</Flex>
