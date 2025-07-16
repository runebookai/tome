<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        title: string;
        tooltip: string;
    }

    const { children, title, tooltip }: Props = $props();

    let ref: HTMLDivElement;
    let visible = $state(false);

    let x = $state(0);
    let y = $state(0);

    function onmouseover() {
        x = ref.getBoundingClientRect().x - 350;
        y = ref.getBoundingClientRect().y - 75;
        visible = true;
    }

    function onmouseout() {
        visible = false;
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<div bind:this={ref} {onmouseover} {onmouseout}>
    {@render children?.()}
</div>

{#if visible}
    <div
        style="top: {y}px; left: {x}px;"
        class="border-light bg-medium text-medium absolute z-50 w-[250px]
        rounded-lg border p-4 px-6 text-sm leading-6 shadow-lg"
    >
        <p class="text-light mb-1 text-base">
            {title}
        </p>

        {tooltip}
    </div>
{/if}
