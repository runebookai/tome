<script lang="ts">
    import { onDestroy } from 'svelte';

    import Box from '$components/Box.svelte';
    import Textarea from '$components/Textarea.svelte';
    import Setting, { CUSTOM_SYSTEM_PROMPT } from '$lib/models/setting';

    interface Props {
        saving?: boolean;
    }

    let { saving = $bindable(false) }: Props = $props();

    let customPrompt = $state('');
    let saveTimeout: number | undefined;
    let isSaving = $state(false);

    const MAX_PROMPT_LENGTH = 5000; // Reasonable limit for system prompts
    const isValid = $derived(customPrompt.length <= MAX_PROMPT_LENGTH);

    // Load existing custom prompt on component mount
    $effect(() => {
        const existingPrompt = Setting.CustomSystemPrompt;
        if (existingPrompt) {
            customPrompt = existingPrompt;
        }
    });

    // Cleanup timeout on component destroy
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
            const existingSetting = Setting.findBy({ key: CUSTOM_SYSTEM_PROMPT });

            if (existingSetting) {
                existingSetting.value = customPrompt;
                await Setting.update(existingSetting);
            } else {
                await Setting.create({
                    display: 'Custom System Prompt',
                    key: CUSTOM_SYSTEM_PROMPT,
                    value: customPrompt,
                    type: 'string',
                });
            }

            saving = true;
            setTimeout(() => (saving = false), 2000);
        } catch (error) {
            console.error('Failed to save custom prompt:', error);
            // Could add user notification here
        } finally {
            isSaving = false;
        }
    }

    function onBlur() {
        // Clear any pending save timeout
        if (saveTimeout) {
            clearTimeout(saveTimeout);
            saveTimeout = undefined;
        }
        // Save immediately when focus is lost
        save();
    }

    function onInput() {
        // Clear any existing timeout
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        // Set a debounced save for 2 seconds of inactivity
        saveTimeout = setTimeout(() => {
            saveTimeout = undefined;
            save();
        }, 2000);
    }
</script>

<Box class="bg-medium w-full flex-col items-start gap-2">
    <h3 class="text-medium mb-2 text-sm font-medium">Custom System Prompt</h3>
    <p class="text-medium mb-4 text-xs">
        Override the default system prompt with your own custom instructions. Leave empty to use the
        default prompt.
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
        class="w-full {!isValid ? 'border-red-500' : ''}"
        rows="4"
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
