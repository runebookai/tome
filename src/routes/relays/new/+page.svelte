<script lang="ts">
    import RelayEditor from '$components/RelayEditor';
    import { Relay } from '$lib/models';

    const relay: Relay = Relay.new();
</script>

<RelayEditor {relay} />
