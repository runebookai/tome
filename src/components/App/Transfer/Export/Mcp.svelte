<script lang="ts">
    import Flex from '$components/Flex.svelte';
    import Args from '$components/Mcp/Transfer/Args.svelte';
    import Command from '$components/Mcp/Transfer/Command.svelte';
    import Env from '$components/Mcp/Transfer/Env.svelte';
    import Server from '$components/Mcp/Transfer/Server.svelte';
    import Title from '$components/Mcp/Transfer/Title.svelte';
    import Redactable from '$components/Redactable.svelte';
    import Cell from '$components/Table/Cell.svelte';
    import Row from '$components/Table/Row.svelte';
    import Table from '$components/Table/Table.svelte';
    import type { SerializedMcpServer } from '$lib/apps';

    interface Props {
        servers: SerializedMcpServer[];
    }

    const { servers }: Props = $props();
</script>

<div class="p-4">
    <blockquote
        class="text-light bg-light border-light mb-4 rounded-md border p-2 px-4 text-sm leading-6"
    >
        MCP server configs often contain secrets, like API Keys, passwords, etc. We do not want them
        exported with the App. We've made a best effort to redact them – ensure there are no secrets
        Tome missed.
    </blockquote>

    {#each servers as server (server.name)}
        <Server>
            <Title {server} />
            <Command {server} />

            <Args {server}>
                <Flex class="text-light flex-wrap font-mono">
                    {#each server.args as arg (arg)}
                        <Redactable value={arg} class="mr-2 mb-2" />
                    {/each}
                </Flex>
            </Args>

            <Env {server}>
                <Table class="font-mono">
                    {#each Object.entries(server.env) as [key, value] (key)}
                        <Row>
                            <Cell><p class="mr-2 mb-2">{key}</p></Cell>
                            <Cell><Redactable {value} class="mr-2 mb-2" /></Cell>
                        </Row>
                    {/each}
                </Table>
            </Env>
        </Server>
    {/each}
</div>
