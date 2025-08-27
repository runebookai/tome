<script lang="ts">
    import { invoke } from '@tauri-apps/api/core';
    import { onMount } from 'svelte';

    import Flex from '$components/Flex.svelte';
    import Icon from '$components/Icon.svelte';
    import Input from '$components/Input.svelte';
    import Args from '$components/Mcp/Transfer/Args.svelte';
    import Command from '$components/Mcp/Transfer/Command.svelte';
    import Env from '$components/Mcp/Transfer/Env.svelte';
    import Server from '$components/Mcp/Transfer/Server.svelte';
    import Title from '$components/Mcp/Transfer/Title.svelte';
    import Spinner from '$components/Spinner.svelte';
    import Cell from '$components/Table/Cell.svelte';
    import Row from '$components/Table/Row.svelte';
    import Table from '$components/Table/Table.svelte';
    import type { SerializedMcpServer } from '$lib/apps';
    import { notNull } from '$lib/util.svelte';

    interface Props {
        server: SerializedMcpServer;

        /**
         * Callback when an MCP server is fully configured and successfully
         * returns metadata.
         */
        onvalid: (server: SerializedMcpServer) => Promise<unknown> | unknown;
    }

    const { server, onvalid }: Props = $props();

    let state: 'ready' | 'pending' | 'invalid' | 'valid' = $state('ready');

    /**
     * Test whether the MCP server is fully configures and able to start up
     */
    async function validate() {
        if (isValid()) {
            state = 'pending';

            if (await isExecutable()) {
                state = 'valid';
                await onvalid(server);
            } else {
                state = 'invalid';
            }
        }
    }

    /**
     * Did the user fill out all required args + ENV
     */
    function isValid() {
        return server.args.every(notNull) && Object.values(server.env).every(notNull);
    }

    /**
     * Can the server successfull start up and return metadata?
     */
    async function isExecutable() {
        try {
            await invoke('get_metadata', {
                command: server.command,
                args: server.args,
                env: server.env,
            });
            return true;
        } catch {
            return false;
        }
    }

    onMount(async () => {
        await validate();
    });
</script>

<Server class={`relative ${state == 'invalid' ? 'border-red' : ''}`}>
    <Flex class="border-light w-full justify-between border-b pr-4">
        <Title {server} />

        <Flex class="w-full justify-end">
            {#if state == 'valid'}
                <Icon name="Check" class="text-green h-4 w-4" />
            {:else if state == 'pending'}
                <p class="text-medium mr-2 text-xs">Checking MCP server</p>
                <Spinner class="h-4 w-4" />
            {:else if state == 'invalid'}
                <p class="text-red mr-2 text-xs">Could not start server</p>
                <Icon name="Error" class="text-red h-4 w-4" />
            {/if}
        </Flex>
    </Flex>

    <div class:opacity-50={['pending', 'valid'].includes(state)}>
        <Command {server} />

        <Args {server}>
            <Flex class="text-light flex-wrap font-mono">
                {#each server.args as arg, j (arg)}
                    {#if arg == null}
                        <Input
                            class="mr-2 w-auto"
                            bind:value={server.args[j]}
                            onblur={validate}
                            disabled={['pending', 'valid'].includes(state)}
                            required
                            placeholder="REQUIRED"
                        />
                    {:else}
                        <p class="mr-4">{arg}</p>
                    {/if}
                {/each}
            </Flex>
        </Args>

        <Env {server}>
            <Table class="font-mono">
                {#each Object.entries(server.env) as [key, value] (key)}
                    <Row>
                        <Cell><p class="mr-2 mb-2">{key}</p></Cell>
                        <Cell>
                            {#if value === null}
                                <Input
                                    class="w-full"
                                    bind:value={server.env[key]}
                                    onblur={validate}
                                    disabled={['pending', 'valid'].includes(state)}
                                    placeholder="REQUIRED"
                                    required
                                />
                            {:else}
                                <p class="ml-2">{value}</p>
                            {/if}
                        </Cell>
                    </Row>
                {/each}
            </Table>
        </Env>
    </div>
</Server>
