<script lang="ts">
    import { page } from '$app/state';

    import Editor from '$components/Relays/Editor.svelte';
    import { Relay } from '$lib/models';

    const relay = $derived(Relay.find(Number(page.params.relay_id)));
</script>

{#key relay}
    <Editor {relay} />
{/key}
