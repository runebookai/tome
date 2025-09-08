<script lang="ts">
    import { page } from '$app/state';

    import Modal from '$components/App/Transfer/Import/Modal.svelte';
    import Layout from '$components/Layouts/Default.svelte';

    const app = page.url.searchParams.get('app') as string;
    const json = decodeURIComponent(app);
    const serializedApp = $state(JSON.parse(json));
</script>

<Layout>
    {#key serializedApp}
        <Modal {serializedApp} />
    {/key}
</Layout>
