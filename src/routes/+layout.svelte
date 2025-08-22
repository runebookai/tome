<!-- App-wide event handlers -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { twMerge } from 'tailwind-merge';
    import { goto, onNavigate } from '$app/navigation';

    import { getTooltip, type TooltipData } from '$components/Tooltip.svelte';
    import closables from '$lib/closables';
    import * as colorscheme from '$lib/colorscheme';
    import { Setting } from '$lib/models';
    import { resync } from '$lib/models';

    const { children } = $props();

    function onclick(e: Event) {
        closables.close(e);
    }

    function onkeypress(e: KeyboardEvent) {
        if (e.key == 'Escape') {
            closables.close(e);
        }
    }

    const metaKeyShortcuts: Record<string, string> = {
        '1': '/chat/latest',
        '2': '/apps',
        '3': '/mcp-servers',
        '4': '/models',
        ',': '/settings',
    };

    const metaKeyShortcutsWithLabs: Record<string, string> = {
        '1': '/chat/latest',
        '2': '/apps',
        '3': '/relays',
        '4': '/mcp-servers',
        '5': '/models',
        ',': '/settings',
    };

    async function onkeydown(e: KeyboardEvent) {
        // manually reload data from database
        if (e.metaKey && e.key == 'r') {
            await resync();
            await goto('/');
        }

        if (
            e.metaKey &&
            Object.keys({ ...metaKeyShortcuts, ...metaKeyShortcutsWithLabs }).includes(e.key)
        ) {
            const keyboardShortcuts = Setting.LabsMode
                ? metaKeyShortcutsWithLabs
                : metaKeyShortcuts;
            await goto(keyboardShortcuts[e.key]);
        }
    }

    onMount(() => {
        colorscheme.apply(Setting.ColorScheme);
    });

    onNavigate(navigation => {
        if (!document.startViewTransition) {
            return;
        }

        return new Promise(resolve => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });
</script>

<svelte:window {onclick} {onkeypress} {onkeydown} />

{#if getTooltip()}
    {@const tooltip = getTooltip() as TooltipData}

    <!-- If we only have a title, render the tooltip in a more compact way -->
    {@const css = tooltip.text === undefined ? 'w-auto p-2 px-4' : 'w-[250px] p-4 px-4'}

    <div
        style="top: {tooltip.y}px; left: {tooltip.x}px;"
        class={twMerge(
            `border-light bg-medium text-medium fixed z-50 w-[250px]
            rounded-lg border p-4 px-6 text-sm leading-6 shadow-lg`,
            css,
            tooltip.css?.toString()
        )}
    >
        <p class="text-light mb-1 text-base">
            {tooltip.title}
        </p>

        {tooltip.text}
    </div>
{/if}

{@render children?.()}
