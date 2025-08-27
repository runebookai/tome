<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    interface Props extends HTMLInputAttributes {
        ref?: HTMLInputElement;
        label?: string | boolean;
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
        validate = _validate,
        ...rest
    }: Props = $props();

    let valid = $state(true);

    function _validate(_: string) {
        return required ? value !== '' && value !== null : true;
    }
</script>

<input
    class={twMerge('border-light w-full rounded-md border p-0 px-2 outline-none', cls?.toString())}
    class:border-red={!valid}
    onkeyup={() => (valid = validate(value))}
    onblur={() => (valid = validate(value))}
    spellcheck="false"
    autocorrect="off"
    autocomplete="off"
    bind:value
    {name}
    {...rest}
/>
