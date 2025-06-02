<script lang="ts">
    import { constantCase } from 'change-case';

    import Flex from '$components/Flex.svelte';
    import Input from '$components/Input.svelte';
    import Svg from '$components/Svg.svelte';
    import { McpServer } from '$lib/models';

    interface Props {
        server: McpServer;
    }

    let { server }: Props = $props();

    let command = $state('');
    let env: [string, string][] = $state([]);

    let key: string = $state('');
    let value: string = $state('');

    $effect.pre(() => {
        if (server) {
            command = `${server.command} ${server.args.join(' ')}`.trim();
            env = Object.entries(server.env);
        }
    });

    async function save() {
        const cmd = command.split(' ');
        server.command = cmd[0];
        server.args = cmd.slice(1);
        server.env = Object.fromEntries(env.map(([k, v]) => [constantCase(k), v]));
        server = await server.save();
    }

    async function addEnv() {
        env.push([key, value]);
        await save();
        key = '';
        value = '';
    }

    async function remove(key: string) {
        env = env.filter(e => e[0] !== key);
        await save();
    }
</script>

<Flex class="w-full flex-col items-start">
    <h1 class="text-purple mb-4 ml-4 text-2xl">{server?.name}</h1>

    <h2 class="text-medium mt-8 mb-4 ml-4 text-xl">Command</h2>
    <Input
        bind:value={command}
        label={false}
        name="command"
        class="w-full"
        onchange={save}
        placeholder="uvx | npx COMMAND [args]"
    />

    <h2 class="text-medium mt-8 mb-4 ml-4 text-xl">ENV</h2>
    <Flex class="grid w-full auto-cols-max auto-rows-max grid-cols-2 gap-4">
        {#each env, i (i)}
            <Input
                onchange={save}
                label={false}
                placeholder="Key"
                bind:value={env[i][0]}
                class="uppercase"
            />

            <Flex>
                <Input onchange={save} label={false} placeholder="Value" bind:value={env[i][1]} />
                <button
                    class="text-dark hover:text-red ml-4 transition duration-300 hover:cursor-pointer"
                    onclick={() => remove(env[i][0])}
                >
                    <Svg name="Delete" class="h-4 w-4" />
                </button>
            </Flex>
        {/each}

        <Input bind:value={key} label={false} placeholder="Key" class="uppercase" />

        <Flex>
            <Input bind:value onchange={addEnv} label={false} placeholder="Value" />
            <div class="ml-4 h-4 w-4"></div>
        </Flex>
    </Flex>
</Flex>
