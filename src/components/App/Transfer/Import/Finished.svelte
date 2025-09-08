<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';

    import Flex from '$components/Flex.svelte';
    import type { SerializedApp } from '$lib/apps';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        app: SerializedApp;
    }

    const { app }: Props = $props();
</script>

<Flex class="h-full w-full flex-0 justify-center p-4">
    <h1>🎉 {app.name} installed</h1>
</Flex>
