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

    async function onkeydown(e: KeyboardEvent) {
        // manually reload data from database
        if (e.metaKey && e.key == 'r') {
            await resync();
            goto('/');
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
