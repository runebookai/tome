<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';
    import Icon from '$components/Icon.svelte';
    import Tooltip from '$components/Tooltip.svelte';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        icon: string;
        title: string;
        tooltip?: string;
    }

    const { icon, title, tooltip, children, class: cls = '' }: Props = $props();
</script>

{#snippet Label(icon: string, title: string)}
    <p class="text-medium m-2 flex w-[150px] min-w-[150px] items-center text-sm">
        <Icon name={icon} class="mr-3" />
        {title}
    </p>
{/snippet}

<Flex class={twMerge('border-b-light w-full items-start border-b p-4', cls?.toString())}>
    {#if tooltip}
        <Tooltip {title} text={tooltip}>
            {@render Label(icon, title)}
        </Tooltip>
        {@render children?.()}
    {:else}
        {@render Label(icon, title)}
        {@render children?.()}
    {/if}
</Flex>
