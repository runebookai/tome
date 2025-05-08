<script lang="ts">
	import Layout from '$components/Layouts/Default.svelte';
	import Modal from '$components/Modal.svelte';
</script>

<Layout>
	<Modal close={() => {}}>
		<h1 class="text-red">Whoops. Something went wrong.</h1>
		<a href="/">Go Back</a>
	</Modal>
</Layout>
