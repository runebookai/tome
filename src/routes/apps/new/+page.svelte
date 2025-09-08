<script lang="ts">
    import Editor from '$components/App/Editor.svelte';
    import { App } from '$lib/models';

    const app: App = App.new();
</script>

<Editor {app} />
