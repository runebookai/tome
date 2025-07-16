<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Flex from '$components/Flex.svelte';

    interface Props extends HTMLInputAttributes {
        ref?: HTMLInputElement;
        label: string | boolean;
        required?: boolean;
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
        ...rest
    }: Props = $props();

    let valid = $state(true);
</script>

<Flex
    class={twMerge(
        'border-light h-12 w-full flex-col items-start rounded-md border px-4',
        cls?.toString()
    )}
>
    {#if label}
        <label class="text-medium mt-4 mb-1 ml-4 text-sm" for={name}>
            {label}
            {#if required}
                <span class="text-red">*</span>
            {/if}
        </label>
    {/if}

    <input
        class={twMerge('w-full p-2 outline-none', cls?.toString())}
        class:border-red={!valid}
        onkeyup={() => (valid = validate(value))}
        onblur={() => (valid = validate(value))}
        spellcheck="false"
        autocorrect="off"
        autocomplete="off"
        {name}
        bind:value
        {...rest}
    />
</Flex>
