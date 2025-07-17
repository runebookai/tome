<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';
    import Icon from '$components/Icon.svelte';
    import Tooltip from '$components/Tooltip.svelte';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        icon: string;
        title: string;
        tooltip: string;
    }

    const { icon, title, tooltip, children, class: cls = '' }: Props = $props();
</script>

<Flex id="name" class={twMerge('border-b-light w-full items-start border-b p-4', cls?.toString())}>
    <Tooltip {title} text={tooltip}>
        <p class="m-2 flex w-[150px] items-center text-sm">
            <Icon name={icon} class="mr-3" />
            {title}
        </p>
    </Tooltip>

    {@render children?.()}
</Flex>
