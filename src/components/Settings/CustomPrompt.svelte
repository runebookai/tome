<script lang="ts">
    import { onDestroy } from 'svelte';

    import Box from '$components/Box.svelte';
    import Textarea from '$components/Textarea.svelte';
    import Setting from '$lib/models/setting.svelte';

    interface Props {
        saving?: boolean;
    }

    let { saving = $bindable(false) }: Props = $props();

    let customPrompt = $state('');
    let saveTimeout: number | undefined;
    let isSaving = $state(false);

    const MAX_PROMPT_LENGTH = 5000;
    const isValid = $derived(customPrompt.length <= MAX_PROMPT_LENGTH);

    // Load existing custom prompt on component mount
    $effect(() => {
        const existingPrompt = Setting.CustomSystemPrompt;
        if (existingPrompt) {
            customPrompt = existingPrompt;
        }
    });

    onDestroy(() => {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
    });

    async function save() {
        // Prevent concurrent saves
        if (isSaving || !isValid) return;

        try {
            isSaving = true;
            Setting.CustomSystemPrompt = customPrompt;
            saving = true;
            setTimeout(() => (saving = false), 2000);
        } catch (error) {
            console.error('Failed to save custom prompt:', error);
        } finally {
            isSaving = false;
        }
    }

    function onBlur() {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
            saveTimeout = undefined;
        }
        save();
    }

    function onInput() {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        // @ts-expect-error LSP thinks this is node
        saveTimeout = setTimeout(() => {
            saveTimeout = undefined;
            save();
        }, 2000);
    }
</script>

<Box class="bg-medium w-full flex-col items-start gap-2">
    <h3 class="font-medium">Custom System Prompt</h3>
    <p class="text-medium text-sm">
        Override the default system prompt. Leave empty to use the default prompt.
        <strong>Note:</strong>
        This will only apply to new conversations. Existing conversations will keep their original system
        prompt.
    </p>

    <Textarea
        label={false}
        bind:value={customPrompt}
        placeholder="You are a helpful assistant..."
        oninput={onInput}
        onblur={onBlur}
        autocorrect="off"
        class="mt-4 w-full {!isValid ? 'border-red-500' : ''}"
        rows={4}
    />

    <div class="flex w-full justify-between text-xs">
        <span class="text-medium">
            {customPrompt.length}/{MAX_PROMPT_LENGTH} characters
        </span>
        {#if !isValid}
            <span class="text-red-500">Prompt is too long</span>
        {/if}
    </div>
</Box>
