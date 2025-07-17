<script lang="ts">
    import { twMerge } from 'tailwind-merge';

    import Svg from '$components/Svg.svelte';

    const { name, class: cls = '', ...props } = $props();
</script>

<Svg {name} class={twMerge('h-[16px] w-[16px]', cls?.toString())} {...props} />
