<script lang="ts">
    import type { HTMLButtonAttributes } from 'svelte/elements';
    import type {} from 'svelte/events';
    import { twMerge } from 'tailwind-merge';

    import Spinner from './Spinner.svelte';

    import type { ButtonEvent } from '$lib/types';

    interface Props extends HTMLButtonAttributes {
        nospinner?: boolean;
    }

    const {
        children,
        class: cls = '',
        nospinner = false,
        onclick: _onclick,
        ...rest
    }: Props = $props();

    let waiting = $state(false);

    async function onclick(e: ButtonEvent) {
        if (_onclick) {
            waiting = true;
            await _onclick(e);
            waiting = false;
        }
    }
</script>

{#if waiting && !nospinner}
    <Spinner />
{:else}
    <button
        class={twMerge('rounded-md border p-2 px-6 text-sm hover:cursor-pointer', cls?.toString())}
        {onclick}
        {...rest}
    >
        {@render children?.()}
    </button>
{/if}
