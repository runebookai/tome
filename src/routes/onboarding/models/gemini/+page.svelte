<script lang="ts">
    import LabeledSection from '$components/Forms/LabeledSection.svelte';
    import Input from '$components/Input.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Modal from '$components/Onboarding/Modal.svelte';
    import { Engine } from '$lib/models';

    let engine = $state(Engine.findBy({ type: 'gemini' }) as Engine);
    let valid = $state(false);

    function onkeyup() {
        valid = engine.options.apiKey !== '';
    }
</script>

<Layout>
    <Modal {engine} disabled={!valid}>
        <LabeledSection icon="Key" title="API Key" class="border-none">
            <Input
                {onkeyup}
                type="password"
                bind:value={engine.options.apiKey}
                required
                placeholder="API Key"
            />
        </LabeledSection>
    </Modal>
</Layout>
