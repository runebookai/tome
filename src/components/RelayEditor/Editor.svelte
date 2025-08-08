<script lang="ts">
    import Section from '$components/RelayEditor/Section.svelte';
    import Button from '$components/Button.svelte';
    import ButtonToggle from '$components/ButtonToggle.svelte';
    import Flex from '$components/Flex.svelte';
    import Input from '$components/Input.svelte';
    import McpServerList from '$components/McpServerList.svelte';
    import ModelSelect from '$components/ModelSelect.svelte';
    import Select from '$components/Select.svelte';
    import { Relay, McpServer, Model } from '$lib/models';

    interface Props {
        relay: Relay;
    }

    let { relay }: Props = $props();

    let mcpServers: McpServer[] = $state(relay.mcpServers);

    function setModel(relay: Relay, model: Model) {
        if (!relay.session) return;

        relay.session.config.engineId = model.engineId as number;
        relay.session.config.model = model.id as string;
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
        relay = await relay.save();

        await mcpServers.awaitAll(async server => {
            await relay.session?.addMcpServer(server);
        });
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

        <Section icon="Chat" title="API Key" tooltip="The API key for your bot" class="items-center">
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
    </Flex>

    <Button class="text-purple border-purple mt-8" onclick={save}>Save</Button>
</section>
