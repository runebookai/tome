<script lang="ts">
    import { page } from '$app/state';

    import Modal from '$components/App/Transfer/Import/Modal.svelte';
    import Layout from '$components/Layouts/Default.svelte';

    const hash = page.url.searchParams.get('hash') as string;
    const json = atob(hash);
    const serializedApp = JSON.parse(json);
</script>

<Layout>
    <Modal {serializedApp} />
</Layout>
