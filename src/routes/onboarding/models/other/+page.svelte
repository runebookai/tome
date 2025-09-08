<script lang="ts">
    import LabeledSection from '$components/Forms/LabeledSection.svelte';
    import Input from '$components/Input.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Modal from '$components/Onboarding/Modal.svelte';
    import { Engine } from '$lib/models';

    let engine = $state(Engine.new({ type: 'openai-compat' }));
    let valid = $state(false);

    function onkeyup() {
        valid = engine.name !== '' && engine.options?.url !== '';
    }
</script>

<Layout>
    <Modal {engine} disabled={!valid}>
        <LabeledSection icon="Text" title="Name">
            <Input {onkeyup} bind:value={engine.name} required placeholder="Name" />
        </LabeledSection>

        <LabeledSection icon="Url" title="URL">
            <Input {onkeyup} bind:value={engine.options.url} required placeholder="URL" />
        </LabeledSection>

        <LabeledSection icon="Key" title="API Key" class="border-none">
            <Input
                {onkeyup}
                bind:value={engine.options.apiKey}
                type="password"
                placeholder="API Key"
            />
        </LabeledSection>
    </Modal>
</Layout>
