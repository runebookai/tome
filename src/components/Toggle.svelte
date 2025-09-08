<script lang="ts">
    import { kebabCase } from 'change-case';
    import type { HTMLInputAttributes } from 'svelte/elements';

    import Flex from '$components/Flex.svelte';
    import type { CheckboxEvent } from '$lib/types';

    interface Props extends HTMLInputAttributes {
        value?: 'on' | 'off';
        label: string;
        disabled?: boolean;
        onenable?: (...args: any[]) => any; // eslint-disable-line
        ondisable?: (...args: any[]) => any; // eslint-disable-line
    }

    const { value, label, disabled, onenable, ondisable, ...rest }: Props = $props();

    let enabled = $state(false);

    function onchange(e: CheckboxEvent) {
        if (e.currentTarget.checked) {
            enabled = true;
            onenable?.();
        } else {
            enabled = false;
            ondisable?.();
        }
    }
</script>

<Flex>
    <div class="toggle">
        <input
            {...rest}
            {disabled}
            {onchange}
            checked={value == 'on'}
            type="checkbox"
            name={kebabCase(label)}
            class:disabled
            class="check"
        />
        <label class:disabled for={kebabCase(label)}></label>
    </div>

    <p class:disabled class={`${enabled ? 'text-grey-200' : 'text-grey-500'} ml-4`}>
        {label}
    </p>
</Flex>

<style>
    [data-theme='dark'] {
        --start: #111;
        ---end: #333;
        --dot: #ccc;
    }

    [data-theme='light'] {
        --start: #999;
        --end: #ccc;
        --dot: #fff;
    }

    .toggle {
        position: relative;
        width: 50px;
        height: 25px;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .check {
        position: absolute;
        width: 50px;
        height: 25px;
        top: 0;
        left: 0;
        z-index: 10;
        opacity: 0;
    }

    label {
        position: absolute;
        top: 0;
        left: 0;
        width: 50px;
        height: 25px;
        border-radius: 50px;
        cursor: pointer;
        background: var(--toggle-gradient);
        transition: all 0.3s ease;
        z-index: 0;
    }

    label.disabled {
        opacity: 25%;
    }

    label:after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 21px;
        height: 21px;
        border-radius: 50%;
        background-color: var(--toggle-color);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
    }

    .check:checked + label {
        background: linear-gradient(to bottom, #4cd96466, #5de24e66);
    }

    .check:checked + label:after {
        transform: translateX(25px);
        background-color: var(--toggle-color);
    }

    p.disabled {
        opacity: 25%;
    }
</style>
