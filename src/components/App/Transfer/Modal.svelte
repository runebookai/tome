<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import { twMerge } from 'tailwind-merge';

    import Modal from '$components/Modal.svelte';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        close: () => Promise<void> | void;
    }

    const { close, children, class: cls = '' }: Props = $props();
</script>

<Modal {close} class={twMerge('w-2/5 p-0', cls?.toString())}>
    {@render children?.()}
</Modal>
