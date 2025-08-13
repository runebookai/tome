<script lang="ts">
    import Section from '$components/RelayEditor/Section.svelte';
    import Button from '$components/Button.svelte';
    import ButtonToggle from '$components/ButtonToggle.svelte';
    import Flex from '$components/Flex.svelte';
    import Input from '$components/Input.svelte';
    import McpServerList from '$components/McpServerList.svelte';
    import ModelSelect from '$components/ModelSelect.svelte';
    import { Relay, McpServer, Model, Config } from '$lib/models';
    import Toggle from '$components/Toggle.svelte';

    interface Props {
        relay: Relay;
    }

    let { relay }: Props = $props();

    let mcpServers: McpServer[] = $state(relay.mcpServers);
    let enabled: 'disabled' | 'enabled' = $state(relay.active ? 'enabled' : 'disabled');

    function getModel(relay: Relay): Model {
        const modelId = relay.session?.config.model;
        return modelId ? Model.find(modelId) || Model.default() : Model.default();
    }

    function setModel(relay: Relay, model: Model) {
        if (!relay.session) return;

        relay.session.config.engineId = model.engineId as number;
        relay.session.config.model = model.id as string;
    }

    function setEnabled(value: string) {
        relay.active = value === 'enabled';
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
        await relay.save();

        await mcpServers.awaitAll(async server => {
            await relay.session?.addMcpServer(server);
        });

        await relay.session?.save();
    }
</script>

<section class="w-full overflow-y-auto p-8">
    <Flex class="border-light text-medium w-full flex-col items-start rounded-md border">
        <Section icon="Relays" title="Name" tooltip="The name of the Relay" class="items-center">
            <Input
                label={false}
                name="name"
                placeholder="Name of the relay"
                class="text-light outline-0"
                bind:value={relay.name}
            />
        </Section>

        <Section icon="Chat" title="Model" tooltip="The model you wish to use with your bot" class="items-center">
            <div class="w-64">
                <ModelSelect
                    class="h-8 rounded-none border-0 border-r"
                    selected={getModel(relay)}
                    onselect={async model => setModel(relay, model)}
                />
            </div>
        </Section>

        <Section icon="Chat" title="Telegram Token" tooltip="The token for your Telegram bot, given to you by Botfather" class="items-center">
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
                    value={relay.active ? 'on' : 'off'}
                    onEnable={() => setEnabled('enabled')}
                    onDisable={() => setEnabled('disabled')}
                />
            </Flex>
        </Section>
    </Flex>

    <Button class="text-purple border-purple mt-8" onclick={save}>Save</Button>
</section>
