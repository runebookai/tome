<script lang="ts">
    import { page } from '$app/state';

    import AppEditor from '$components/AppEditor';
    import { App } from '$lib/models';

    const app = $derived(App.find(Number(page.params.app_id)));
</script>

{#key app}
    <AppEditor {app} />
{/key}
