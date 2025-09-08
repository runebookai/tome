<script lang="ts">
    import { twMerge } from 'tailwind-merge';

    const { children, class: cls = '' } = $props();
</script>

<table class={twMerge('text-light w-full', cls?.toString())}>
    {@render children?.()}
</table>
