<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Redactable from '$lib/redaction.svelte';

    interface Props extends HTMLAttributes<HTMLParagraphElement> {
        value: Redactable;
    }

    const { value, class: cls = '' }: Props = $props();

    function redact(e: Event) {
        e.stopPropagation();
        value.redact();
    }

    function reveal(e: Event) {
        e.stopPropagation();
        value.reveal();
    }
</script>

{#if value.isRedacted()}
    <button
        title="Reveal"
        onclick={reveal}
        class={twMerge(
            'text-red border-light rounded-sm border px-2 line-through hover:cursor-pointer',
            cls?.toString()
        )}
    >
        REDACTED
    </button>
{:else}
    <button
        title="Redact"
        onclick={redact}
        class={twMerge(
            'border-light rounded-sm border px-2 hover:cursor-pointer hover:line-through',
            cls?.toString()
        )}
    >
        {value}
    </button>
{/if}
