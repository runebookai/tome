<script module>
    import type { ClassValue } from 'svelte/elements';

    export interface TooltipData {
        x: number;
        y: number;
        title: string;
        text?: string;
        css?: ClassValue | null;
    }

    let tooltip: TooltipData | null = $state(null);

    export function getTooltip() {
        return tooltip;
    }

    export function setTooltip(t: TooltipData) {
        tooltip = t;
    }

    export function clearTooltip() {
        tooltip = null;
    }
</script>

<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        title: string;
        text?: string;
    }

    const { children, title, text, class: css = '' }: Props = $props();

    let ref: HTMLDivElement;

    function onmouseover() {
        const rx = ref.getBoundingClientRect().x;
        const ry = ref.getBoundingClientRect().y;
        const rw = ref.getBoundingClientRect().width;

        // If the element with the Tooltip is too close to the left side of the
        // window, so that the prompt won't fit, move it to the right side.
        const x = rx < 375 ? rx + rw + 8 : rx - 258;
        const y = ry - 8;

        setTooltip({ x, y, title, text, css });
    }

    /**
     * For whatever reason, clicking an element with a Tooltip makes the
     * Tooltip stick and not disappear. So just force it to, in that case.
     * :shrug:
     */
    function onmousedown() {
        clearTooltip();
    }

    function onmouseout() {
        clearTooltip();
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<div bind:this={ref} {onmouseover} {onmouseout} {onmousedown}>
    {@render children?.()}
</div>
