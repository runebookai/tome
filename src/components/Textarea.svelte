<script lang="ts">
    import type { HTMLTextareaAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';

    interface Props extends HTMLTextareaAttributes {
        ref?: HTMLTextAreaElement;
        label: string | boolean;
        required?: boolean;
        value: string;
        validate?: (value: string) => boolean;
    }

    let {
        label,
        name,
        class: cls = '',
        required = false,
        ref = $bindable(),
        value = $bindable(),
        validate = () => true,
        autocomplete,
        autocorrect,
        ...rest
    }: Props = $props();

    let valid = $state(true);
</script>

<Flex class="w-full flex-col items-start">
    {#if label}
        <label class="text-medium mt-2 mb-1 ml-2 text-sm" for={name}>
            {label}
            {#if required}
                <span class="text-red">*</span>
            {/if}
        </label>
    {/if}
    <textarea
        class={twMerge(
            'border-light min-h-[100px] w-full resize-y rounded-md border p-2 px-4 outline-none',
            cls?.toString()
        )}
        {name}
        class:border-red={!valid}
        onkeyup={() => (valid = validate?.(value))}
        onblur={() => (valid = validate?.(value))}
        {autocomplete}
        {autocorrect}
        bind:value
        bind:this={ref}
        {...rest}
    ></textarea>
</Flex>
