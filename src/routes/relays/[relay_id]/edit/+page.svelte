<script lang="ts">
    import { page } from '$app/state';

    import RelayEditor from '$components/RelayEditor';
    import { Relay } from '$lib/models';

    const relay = $derived(Relay.find(Number(page.params.relay_id)));
</script>

{#key relay}
    <RelayEditor {relay} />
{/key}
