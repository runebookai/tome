<script lang="ts">
    import { page } from '$app/state';

    import Modal from '$components/App/Transfer/Import/Modal.svelte';
    import Layout from '$components/Layouts/Default.svelte';

    const serializedApp = JSON.parse(atob(page.url.hash.replace('#', '')));
</script>

<Layout>
    <Modal {serializedApp} />
</Layout>
