<script lang="ts">
    import { goto } from '$app/navigation';

    import Button from '$components/Button.svelte';
    import Flex from '$components/Flex.svelte';
    import Input from '$components/Input.svelte';
    import McpServerList from '$components/McpServerList.svelte';
    import ModelSelect from '$components/ModelSelect.svelte';
    import Section from '$components/RelayEditor/Section.svelte';
    import Toggle from '$components/Toggle.svelte';
    import { App, McpServer, Model, Relay, Session } from '$lib/models';

    interface Props {
        relay: Relay;
    }

    let { relay }: Props = $props();

    let status = $state('');
    let mcpServers: McpServer[] = $state(relay.mcpServers);
    let enabled = $state(relay.active);
    let session = $state(
        relay.session || Session.new({ appId: App.RELAY.id, relay: true, ephemeral: true })
    );

    async function setModel(model: Model) {
        session.config.engineId = model.engineId as number;
        session.config.model = model.id as string;
    }

    function setEnabled() {
        relay.active = true;
    }

    function setDisabled() {
        relay.active = false;
    }

    function hasMcpServer(server: McpServer) {
        return mcpServers.includes(server);
    }

    function addMcpServer(server: McpServer) {
        mcpServers.push(server);
    }

    function removeMcpServer(server: McpServer) {
        mcpServers = mcpServers.filter(s => s !== server);
    }

    async function save() {
        status = 'Saving';
        session = await session.save();

        relay.sessionId = session.id;
        relay = await relay.save();

        await mcpServers.awaitAll(async server => {
            await relay.session?.addMcpServer(server);
        });

        if (relay.active) {
            status = 'Starting MCP servers';
            await session.start();
        } else {
            status = 'Stopping MCP servers';
            await session.stop();
        }

        status = '';
        await goto(`/relays/${relay.id}/edit`);
    }
</script>

<section class="w-full overflow-y-auto p-8">
    <Flex class="border-light text-medium w-full flex-col items-start rounded-md border">
        <Section icon="Relays" title="Name" tooltip="The name of the Relay" class="items-center">
            <Input
                label={false}
                name="Relays"
                placeholder="Name of the relay"
                class="text-light outline-0"
                bind:value={relay.name}
            />
        </Section>

        <Section
            icon="Models"
            title="Model"
            tooltip="The model you wish to use with your bot"
            class="items-center"
        >
            <div class="w-64">
                <ModelSelect
                    class="border-light h-10 rounded-sm border"
                    selected={session.model}
                    onselect={setModel}
                />
            </div>
        </Section>

        <Section
            icon="Key"
            title="Telegram Token"
            tooltip="The token for your Telegram bot, given to you by Botfather"
            class="items-center"
        >
            <Input
                label={false}
                name="api_key"
                placeholder="API key"
                class="text-light outline-0"
                bind:value={relay.config.api_key}
                type="password"
            />
        </Section>

        <Section
            icon="MCP"
            title="MCP"
            tooltip="The collection of MCP servers to enable for this Relay"
        >
            <Flex class="grow">
                <McpServerList {hasMcpServer} {addMcpServer} {removeMcpServer} />
            </Flex>
        </Section>

        <Section
            icon="Pulse"
            title="Enabled"
            tooltip="Enable or disable the Relay"
            class="h-20 items-center"
        >
            <Flex class="px-3 py-2">
                <Toggle
                    label=""
                    value={enabled ? 'on' : 'off'}
                    onEnable={() => setEnabled()}
                    onDisable={() => setDisabled()}
                />
            </Flex>
        </Section>
    </Flex>

    <Flex class="mt-8">
        <Button class="text-purple border-purple" onclick={save}>Save</Button>
        <p class="text-medium ml-4 text-sm">{status}</p>
    </Flex>
</section>
