<script lang="ts">
    import OptionView from './Option.svelte';
    import type { Option, OptionGroup } from './types';

    import Flex from '$components/Flex.svelte';
    import Icon from '$components/Icon.svelte';

    interface Props {
        group: OptionGroup;
        onselect: (option: Option) => Promise<unknown> | unknown;
    }

    let { group, onselect }: Props = $props();
</script>

<Flex
    class="bg-medium noscrollbar border-light absolute top-full
    z-50 h-96 max-h-96 w-full flex-col items-start
    overflow-y-auto rounded-md rounded-t-none border border-t-0 text-sm"
>
    {#if group.label}
        <Flex
            class="text-medium border-light w-full border-t
        px-4 py-2 pt-4 text-xs font-medium uppercase"
        >
            {#if group.icon}
                <Icon name={group.icon} class="mr-2" />
            {/if}
            <p>{group.label}</p>
        </Flex>
    {/if}

    <Flex class="w-full flex-col items-start">
        {#each group.options as option (option.value)}
            <OptionView onclick={onselect} {...option} />
        {/each}
    </Flex>
</Flex>
