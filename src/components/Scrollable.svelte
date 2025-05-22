<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        ref?: HTMLDivElement;
    }

    let { children, ref = $bindable(), class: cls = '' }: Props = $props();
</script>

<Flex bind:ref class={twMerge('h-full w-full items-start overflow-y-scroll', cls?.toString())}>
    <div class="w-full">
        {@render children?.()}
    </div>

    <!--
    Scrollbars, by default, are _inside_ the padding of an element. Which
    means it will always overlap the content within. This looks shitty, so force
    the scrollable view to have extra space on the right by shoving a div in
    there.
    -->
    <div class="h-full w-6"></div>
</Flex>
