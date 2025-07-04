<!-- App-wide event handlers -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto, onNavigate } from '$app/navigation';

    import closables from '$lib/closables';
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
        '2': '/tasks',
        '3': '/mcp-servers',
        '4': '/models',
        ',': '/settings',
    };

    async function onkeydown(e: KeyboardEvent) {
        // manually reload data from database
        if (e.metaKey && e.key == 'r') {
            await resync();
            await goto('/');
        }

        if (e.metaKey && Object.keys(metaKeyShortcuts).includes(e.key)) {
            await goto(metaKeyShortcuts[e.key]);
        }
    }

    onMount(() => {
        document.documentElement.setAttribute('data-theme', Setting.ColorScheme as string);
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

{@render children?.()}
