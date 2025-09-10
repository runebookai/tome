<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import closables from '$lib/closables';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        close?: () => void | Promise<void>;
        noclose?: boolean;
    }

    const { children, close, noclose = false, class: cls = '' }: Props = $props();
    let ref: HTMLDivElement;

    $effect(() => {
        const w = ref.getBoundingClientRect().width;
        const h = ref.getBoundingClientRect().height;

        ref.style.marginTop = `-${Math.round(h / 2)}px`;
        ref.style.marginLeft = `-${Math.round(w / 2)}px`;

        if (close && !noclose) {
            closables.register(ref, close);
        }

        return () => {
            if (close && !noclose) {
                closables.unregister(ref);
            }
        };
    });
</script>

<div class="bg-dark/80 fixed top-0 left-0 z-20 h-screen w-screen"></div>

<div
    bind:this={ref}
    class={twMerge(
        'border-light bg-dark fixed top-[50%] left-[50%] z-30',
        'm-auto max-h-3/4 max-w-3/4 min-w-2/5 rounded-xl border p-8',
        'shadow-2xl',
        cls?.toString()
    )}
>
    {@render children?.()}
</div>
