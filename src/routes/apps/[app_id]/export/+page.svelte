<script lang="ts">
    import { page } from '$app/state';

    import Modal from '$components/App/Transfer/Export/Modal.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import { App } from '$lib/models';

    const appId = Number(page.params.app_id);
    const app = App.find(appId);
</script>

<Layout>
    <Modal {app} />
</Layout>
