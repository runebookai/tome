<script lang="ts">
    import { constantCase } from 'change-case';
    import { goto } from '$app/navigation';

    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
    import Input from '$components/Input.svelte';
    import Svg from '$components/Svg.svelte';
    import { McpServer } from '$lib/models';
    import { join, split } from '$lib/shellwords';

    interface Props {
        server: McpServer;
    }

    let { server }: Props = $props();

    let command = $state('');
    let env: [string, string][] = $state([]);

    let key: string = $state('');
    let value: string = $state('');

    let error: string | null = $state(null);

    async function save() {
        error = null;

        if (command == '') {
            return;
        }

        const cmd = split(command);
        server.command = cmd[0];
        server.args = cmd.slice(1);
        server.env = Object.fromEntries(env.map(([k, v]) => [constantCase(k), v]));

        try {
            server = await server.save();
            goto(`/mcp-servers/${server.id}`);
        } catch (e) {
            if (e instanceof Error) {
                error = e.message;
            }

            if (typeof e == 'string') {
                if (e.includes('initialize response')) {
                    error = 'mcp server could not initialize';
                } else {
                    error = e;
                }
            }
            return;
        }
    }

    async function update() {
        if (server.id) {
            await save();
        }
    }

    async function addEnv() {
        env.push([key, value]);
        key = '';
        value = '';
    }

    async function remove(key: string) {
        env = env.filter(e => e[0] !== key);
        await save();
    }

    $effect.pre(() => {
        if (server) {
            command = `${server.command} ${join(server.args)}`.trim();
            env = Object.entries(server.env);
        }
    });
</script>

<Flex class="w-full flex-col items-start">
    {#if server?.id}
        <h1 class="text-purple mb-8 ml-4 text-2xl">{server.name}</h1>
    {:else}
        <h1 class="text-light mb-8 ml-4 text-2xl">Add Server</h1>
    {/if}

    <h2 class="text-medium mb-4 ml-4 text-xl">Command</h2>

    <Input
        bind:value={command}
        label={false}
        name="command"
        class="w-full"
        onchange={update}
        placeholder="uvx | npx COMMAND [args]"
    />

    <Flex class="mt-8 mb-4 ml-4 items-center">
        <h2 class="text-medium text-lg">ENV</h2>
        <button class="border-light ml-4 h-6 w-6 rounded-md border">
            <p class="text-medium h-6 w-6 pr-0.5 text-center text-[12px] !leading-[18px]">+</p>
        </button>
    </Flex>

    {#each env, i (i)}
        <Flex class="mb-4 w-full gap-4">
            <Input
                onchange={update}
                label={false}
                placeholder="Key"
                bind:value={env[i][0]}
                class="uppercase"
            />

            <Input onchange={update} label={false} placeholder="Value" bind:value={env[i][1]} />

            <button
                class="text-dark hover:text-red ml-4 transition duration-300 hover:cursor-pointer"
                onclick={() => remove(env[i][0])}
            >
                <Svg name="Delete" class="h-4 w-4" />
            </button>
        </Flex>
    {/each}

    <Flex class="mb-8 w-full gap-4">
        <Input bind:value={key} label={false} placeholder="Key" class="uppercase" />
        <Input bind:value onchange={addEnv} label={false} placeholder="Value" />
        <div class="w-16"></div>
    </Flex>

    {#if !server?.id}
        <Flex class="w-full">
            <Button class="border-purple text-purple" onclick={save}>Save</Button>

            {#if error}
                <Flex class="text-red ml-4">
                    <Svg name="Warning" class="mr-2 h-4 w-4" />
                    {error}
                </Flex>
            {/if}
        </Flex>
    {/if}
</Flex>
