<script lang="ts">
    import { page } from '$app/state';

    import Editor from '$components/App/Editor.svelte';
    import { App } from '$lib/models';

    const app = $derived(App.find(Number(page.params.app_id)));
</script>

{#key app}
    <Editor {app} />
{/key}
