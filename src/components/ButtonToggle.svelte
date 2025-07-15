<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';

    import Flex from './Flex.svelte';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        values: string[];
        value: string;
    }

    let { values, value = $bindable(), class: cls = '' }: Props = $props();
    let pos = $state(value == values[0] ? 'left-[4px]' : 'left-1/2');

    function setValue(val: string) {
        value = val;
        pos = val == values[0] ? 'left-[4px]' : 'left-1/2';
    }
</script>

<Flex class={`border-xlight relative z-0 h-full rounded-md border ${cls?.toString()}`}>
    <button
        onclick={() => setValue(values[0])}
        class={`z-20 h-full w-28 text-center text-xs uppercase hover:cursor-pointer ${value == values[0] ? 'text-light font-medium' : ''}`}
    >
        {values[0]}
    </button>

    <button
        onclick={() => setValue(values[1])}
        class={`z-20 h-full w-28 text-center text-xs uppercase hover:cursor-pointer ${value == values[1] ? 'text-light font-medium' : ''}`}
    >
        {values[1]}
    </button>

    <div
        class={`bg-light absolute transition-all ${pos} top-[4px] z-10 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-sm`}
    ></div>
</Flex>
