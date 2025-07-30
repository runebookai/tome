<script lang="ts">
    import { constantCase } from 'change-case';
    import { goto } from '$app/navigation';

    import Button from './Button.svelte';

    import Flex from '$components/Flex.svelte';
    import Input from '$components/Input.svelte';
    import Svg from '$components/Svg.svelte';
    import { McpServer, type TransportConfig } from '$lib/models';
    import { join, split } from '$lib/shellwords';

    interface Props {
        server: McpServer;
    }

    let { server }: Props = $props();

    let command = $state('');
    let env: [string, string][] = $state([]);
    let transportType = $state('stdio');
    let transportConfig: TransportConfig = $state({
        authentication: {
            type: 'none',
            token: '',
            username: '',
            password: '',
        },
    });

    let key: string = $state('');
    let value: string = $state('');

    let error: string | null = $state(null);

    async function save() {
        error = null;

        // Validate required fields based on transport type
        if (transportType === 'stdio' && command === '') {
            error = 'Command is required for stdio transport';
            return;
        }

        if (transportType === 'http') {
            if (!transportConfig.url) {
                error = 'URL is required for HTTP transport';
                return;
            }
            
            // Validate URL format
            try {
                new URL(transportConfig.url);
            } catch (e) {
                error = 'Please enter a valid URL (e.g., https://example.com/mcp)';
                return;
            }
        }

        // Set transport type and config
        server.transportType = transportType;
        server.transportConfig = transportConfig;

        if (transportType === 'stdio') {
            const cmd = split(command);
            server.command = cmd[0];
            server.args = cmd.slice(1);
            server.env = Object.fromEntries(env.map(([k, v]) => [constantCase(k), v]));
        } else {
            // For HTTP transport, clear stdio-specific fields
            server.command = '';
            server.args = [];
            server.env = {};
        }

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

    function initializeAuth() {
        if (!transportConfig.authentication) {
            transportConfig.authentication = { type: 'none' };
        }
    }

    $effect.pre(() => {
        if (server) {
            command = `${server.command} ${join(server.args)}`.trim();
            env = Object.entries(server.env);
            transportType = server.transportType || 'stdio';
            transportConfig = server.transportConfig || {};
            initializeAuth();
        }
    });
</script>

<Flex class="w-full flex-col items-start">
    {#if server?.id}
        <h1 class="text-purple mb-8 ml-4 text-2xl">{server.name}</h1>
    {:else}
        <h1 class="text-light mb-8 ml-4 text-2xl">Add Server</h1>
    {/if}

    <!-- Transport Type Selection -->
    <h2 class="text-medium mb-4 ml-4 text-xl">Transport Type</h2>
    <Flex class="mb-8 ml-4 gap-8">
        <label class="flex cursor-pointer items-center">
            <input
                type="radio"
                bind:group={transportType}
                value="stdio"
                onchange={update}
                class="mr-2"
            />
            <span class="text-medium">Standard I/O</span>
        </label>
        <label class="flex cursor-pointer items-center">
            <input
                type="radio"
                bind:group={transportType}
                value="http"
                onchange={update}
                class="mr-2"
            />
            <span class="text-medium">HTTP</span>
        </label>
    </Flex>

    {#if transportType === 'stdio'}
        <!-- Stdio Transport Fields -->
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
    {:else}
        <!-- HTTP Transport Fields -->
        <h2 class="text-medium mb-4 ml-4 text-xl">Server URL</h2>

        <Input
            bind:value={transportConfig.url}
            label={false}
            name="url"
            class="w-full"
            onchange={update}
            placeholder="https://example.com/mcp"
        />
        <div class="text-dark mt-2 ml-4 text-xs">
            Enter the full URL where your MCP server is hosted. Make sure the server is running and accessible.
        </div>

        <h2 class="text-medium mt-8 mb-4 ml-4 text-xl">Authentication (Optional)</h2>

        <Flex class="mb-4 w-full gap-4">
            <select
                bind:value={transportConfig.authentication.type}
                onchange={update}
                class="border-light w-full rounded-md border p-2 px-4 outline-none"
            >
                <option value="none">No Authentication</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
            </select>
        </Flex>

        {#if transportConfig.authentication.type === 'bearer'}
            <Input
                bind:value={transportConfig.authentication.token}
                label={false}
                name="token"
                class="mb-4 w-full"
                onchange={update}
                placeholder="Bearer token"
            />
        {:else if transportConfig.authentication.type === 'basic'}
            <Flex class="mb-4 w-full gap-4">
                <Input
                    bind:value={transportConfig.authentication.username}
                    label={false}
                    name="username"
                    onchange={update}
                    placeholder="Username"
                />
                <Input
                    bind:value={transportConfig.authentication.password}
                    label={false}
                    name="password"
                    type="password"
                    onchange={update}
                    placeholder="Password"
                />
            </Flex>
        {/if}

        <h2 class="text-medium mt-8 mb-4 ml-4 text-xl">Settings (Optional)</h2>

        <Flex class="mb-4 w-full gap-4">
            <Input
                bind:value={transportConfig.timeout}
                label="Timeout (ms)"
                name="timeout"
                type="number"
                onchange={update}
                placeholder="30000"
            />
            <Input
                bind:value={transportConfig.retries}
                label="Retries"
                name="retries"
                type="number"
                onchange={update}
                placeholder="3"
            />
        </Flex>
    {/if}

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
