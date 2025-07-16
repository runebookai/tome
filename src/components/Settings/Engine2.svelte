<script lang="ts">
    import { capitalCase } from 'change-case';

    import Box from '$components/Box.svelte';
    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
    import Icon from '$components/Icon.svelte';
    import Input from '$components/Input.svelte';
    import Svg from '$components/Svg.svelte';
    import { Engine } from '$lib/models';

    const NON_DELETEABLE_ENGINES = ['ollama', 'openai', 'gemini'];
    const IMMUTABLE_URLS = ['openai', 'gemini'];

    interface Props {
        explicitSave?: boolean;
        engine?: Engine;
        ondelete?: (engine: Engine) => Promise<unknown> | unknown;
        onsave?: (engine: Engine) => Promise<unknown> | unknown;
        saving?: boolean;
    }

    let {
        explicitSave = false,
        engine = $bindable(Engine.new()),
        saving = $bindable(false),
        ondelete = () => {},
        onsave = () => {},
    }: Props = $props();

    let connectionError = $state(false);
    let nameCss = $state('');
    let urlCss = $state('');

    const icon = capitalCase(engine.type == 'openai-compat' ? 'openai' : engine.type);
    const hasApiKey = engine.type !== 'ollama';
    const isImmutableUrl = ['openai', 'gemini'].includes(engine.type);
    const isDeletable = !NON_DELETEABLE_ENGINES.includes(engine.type);

    async function validateDefaultEngine() {
        let valid = true;

        if (engine.type == 'ollama' && engine.options.url !== '') {
            valid = await validateConnected();
        }

        if (engine.type !== 'ollama' && engine.options.apiKey !== '') {
            valid = await validateConnected();
        }

        return valid;
    }

    async function validateNonDefaultEngine() {
        let valid = true;

        if (engine.name == '') {
            nameCss = '!border-red';
            valid = false;
        }

        if (engine.options.url == '') {
            urlCss = 'border-red';
            valid = false;
        }

        if (valid && !(await validateConnected())) {
            connectionError = true;
            valid = false;
        }

        return valid;
    }

    async function validateConnected() {
        let valid = true;

        try {
            const connected = await engine.client?.connected();
            if (!connected) throw 'ConnectionError';
            connectionError = false;
        } catch {
            connectionError = true;
            valid = false;
        }

        return valid;
    }

    async function validate() {
        if (NON_DELETEABLE_ENGINES.includes(engine.type)) {
            return await validateDefaultEngine();
        } else {
            return await validateNonDefaultEngine();
        }
    }

    async function autosave() {
        if (!explicitSave) {
            await save();
            saving = true;
            setTimeout(() => (saving = false), 2000);
        }
    }

    async function save() {
        if (!(await validate())) {
            return;
        }

        await engine.save();
        await onsave(engine);
        saving = true;
        setTimeout(() => (saving = false), 2000);
    }
</script>

<Box
    class={`bg-medium text-medium w-full flex-col items-start p-0 ${connectionError ? '!border-red' : ''}`}
>
    <Flex class="text-light border-b-light w-full border-b p-2">
        {#if engine.isPersisted()}
            <Flex class="w-full">
                <Icon name={icon} class="m-2 mr-4" />
                {engine.name}

                {#if isDeletable}
                    <button
                        onclick={() => ondelete(engine)}
                        class="mr-4 ml-auto hover:cursor-pointer"
                    >
                        <Icon name="Delete" class="text-dark h-4 w-4" />
                    </button>
                {/if}
            </Flex>
        {:else}
            <p class="text-medium m-2 flex w-[100px] items-center text-sm">
                Name
                <span class="text-red">*</span>
            </p>

            <Input
                label={false}
                bind:value={engine.name}
                placeholder="Engine name"
                onchange={autosave}
                class={nameCss}
            />
        {/if}
    </Flex>

    <Flex class="w-full p-2">
        <p class="m-2 flex w-[100px] items-center text-sm">
            URL
            <span class="text-red">*</span>
        </p>

        <Input
            label={false}
            bind:value={engine.options.url}
            placeholder="http://localhost:1234"
            class="text-light {urlCss}"
            disabled={isImmutableUrl}
            onchange={autosave}
        />
    </Flex>

    {#if hasApiKey}
        <Flex class="border-t-light w-full border-t p-2">
            <p class="m-2 flex w-[100px] items-center text-sm">API Key</p>

            <Input
                type="password"
                label={false}
                bind:value={engine.options.apiKey}
                placeholder="•••••••••••••••••••••••••••••••••••••••••••••••••••••••"
                class="text-light"
                onchange={autosave}
            />
        </Flex>
    {/if}

    {#if explicitSave}
        <Flex class="border-t-light w-full border-t">
            <Button onclick={save} class="border-xlight text-light m-2 mr-4">Save</Button>
            <button onclick={() => ondelete(engine)} class="text-sm hover:cursor-pointer">
                cancel
            </button>

            {#if connectionError}
                <Flex class="text-red mr-4 ml-auto text-sm">
                    <Svg name="Error" class="text-red mr-2 h-4 w-4" />
                    Connection Error
                </Flex>
            {/if}
        </Flex>
    {/if}
</Box>
