<script lang="ts">
    import { page } from '$app/state';

    import Editor from '$components/App/Editor.svelte';
    import { App } from '$lib/models';

    const app = App.find(Number(page.params.app_id));
    const mcpServers = app.savableMcpServers;
</script>

{#key app}
    <Editor {app} {mcpServers} />
{/key}
