<script lang="ts">
    import LabeledSection from '$components/Forms/LabeledSection.svelte';
    import Input from '$components/Input.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Modal from '$components/Onboarding/Modal.svelte';
    import { Engine } from '$lib/models';

    let engine = $state(Engine.findBy({ type: 'ollama' }) as Engine);
    let valid = $state(true);

    function onkeyup() {
        valid = engine.options.url !== '';
    }
</script>

<Layout>
    <Modal {engine} disabled={!valid}>
        <LabeledSection icon="Url" title="URL" class="border-none">
            <Input {onkeyup} bind:value={engine.options.url} required placeholder="URL" />
        </LabeledSection>
    </Modal>
</Layout>
