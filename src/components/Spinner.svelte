<script lang="ts">
    import { twMerge } from 'tailwind-merge';

    const { class: cls = 'w-[24px] h-[24px]' } = $props();
</script>

<div class={twMerge('spinner', cls?.toString())}></div>

<style>
    .spinner {
        border-radius: 50%;
        position: relative;
        animation: rotate 1s linear infinite;
    }
    .spinner::before {
        content: '';
        box-sizing: border-box;
        position: absolute;
        inset: 0px;
        border-radius: 50%;
        border: 3px solid var(--text-color-medium);
        animation: prixClipFix 2s linear infinite;
    }

    @keyframes rotate {
        100% {
            transform: rotate(360deg);
        }
    }

    @keyframes prixClipFix {
        0% {
            clip-path: polygon(50% 50%, 0 0, 0 0, 0 0, 0 0, 0 0);
        }
        25% {
            clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 0, 100% 0, 100% 0);
        }
        50% {
            clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%);
        }
        75% {
            clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 100%);
        }
        100% {
            clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 0);
        }
    }
</style>
