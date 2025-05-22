<script lang="ts">
    import type { HTMLButtonAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    const { children, class: cls = '', ...rest }: HTMLButtonAttributes = $props();
</script>

<button
    class={twMerge('rounded-md border p-2 px-6 text-sm hover:cursor-pointer', cls?.toString())}
    {...rest}
>
    {@render children?.()}
</button>
