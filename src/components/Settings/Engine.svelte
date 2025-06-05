<script lang="ts">
    import { capitalCase } from 'change-case';

    import Box from '$components/Box.svelte';
    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
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
            nameCss = '!placeholder-red';
            valid = false;
        }

        if (engine.options.url == '') {
            urlCss = 'border-red/25';
            valid = false;
        }

        if (!(await validateConnected())) {
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
    class={`bg-medium group w-full flex-col items-start gap-2 ${connectionError ? '!border-red' : ''}`}
>
    <Flex class="w-full justify-between">
        <Flex class="mb-2 items-center">
            {#if NON_DELETEABLE_ENGINES.includes(engine.type)}
                <Svg name={capitalCase(engine.type)} class="ml-2 h-4 w-4 text-white" />
            {/if}

            <Input
                label={false}
                bind:value={engine.name}
                placeholder="Name"
                disabled={NON_DELETEABLE_ENGINES.includes(engine.type)}
                onchange={autosave}
                class={`w-full border-transparent p-0 pl-2 ${nameCss}`}
            />

            {#if connectionError}
                <Flex class="text-red w-full">
                    <Svg name="Warning" class="mr-2 h-4 w-4" />
                    <p class="w-full">Connection Error</p>
                </Flex>
            {/if}
        </Flex>

        {#if !NON_DELETEABLE_ENGINES.includes(engine.type)}
            <button
                onclick={() => ondelete(engine)}
                class="hover:text-red mr-2 hidden transition group-hover:block hover:cursor-pointer"
            >
                <Svg name="Delete" class="h-3 w-3" />
            </button>
        {/if}
    </Flex>

    <Flex class={`border-light pb-2', w-full flex-col items-start rounded-md border ${urlCss}`}>
        <label for="new-engine-url" class="text-medium m-0 block h-6 p-0 pl-4 text-[10px]">
            URL <span class="text-red">*</span>
        </label>
        <Input
            label={false}
            placeholder="https://..."
            name="new-engine-url"
            bind:value={engine.options.url}
            disabled={IMMUTABLE_URLS.includes(engine.type)}
            onchange={autosave}
            class="m-0 ml-4 w-full border-0 p-0 pb-2"
        />
    </Flex>

    {#if engine.type !== 'ollama'}
        <Flex
            class="border-light w-full flex-col items-start
        overflow-x-hidden rounded-md border pr-2 pb-2"
        >
            <label for="new-engine-api-key" class="text-medium m-0 block h-6 p-0 pl-4 text-[10px]">
                API Key
            </label>
            <Input
                type="password"
                label={false}
                placeholder="..."
                name="new-engine-api-key"
                bind:value={engine.options.apiKey}
                onchange={autosave}
                class="m-0 ml-4 overflow-x-hidden border-0 p-0 pr-8"
            />
        </Flex>
    {/if}

    {#if explicitSave}
        <Button onclick={save} class="border-light mt-2">Save</Button>
    {/if}
</Box>
