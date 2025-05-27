<!-- App-wide event handlers -->
<script lang="ts">
    import { goto, onNavigate } from '$app/navigation';

    import closables from '$lib/closables';
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
