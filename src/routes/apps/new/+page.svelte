<script lang="ts">
    import AppEditor from '$components/AppEditor';
    import { App } from '$lib/models';

    const app: App = App.new();
</script>

<AppEditor {app} />
