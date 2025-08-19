<script lang="ts">
    import { twMerge } from 'tailwind-merge';

    const { children, class: cls = '' } = $props();
</script>

<tr class={twMerge('w-full', cls?.toString())}>
    {@render children?.()}
</tr>
