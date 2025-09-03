<script lang="ts">
    import Editor from '$components/Relays/Editor.svelte';
    import { Relay } from '$lib/models';

    const relay: Relay = Relay.new();
</script>

<Editor {relay} />
