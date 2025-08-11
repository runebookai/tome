<script lang="ts">
    import { invoke } from '@tauri-apps/api/core';
    import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
    import { page } from '$app/state';

    import { CHAT_APP_ID } from '$lib/const';
    import Chat from '$components/Chat.svelte';
    import Deleteable from '$components/Deleteable.svelte';
    import Flex from '$components/Flex.svelte';
    import Layout from '$components/Layouts/Default.svelte';
    import Link from '$components/Link.svelte';
    import List from '$components/List.svelte';
    import Menu, { type MenuItem } from '$components/Menu.svelte';
    import ModelMenu from '$components/ModelMenu.svelte';
    import Svg from '$components/Svg.svelte';
    import Toggle from '$components/Toggle.svelte';
    import Engine from '$lib/models/engine.svelte';
    import McpServer from '$lib/models/mcp-server.svelte';
    import Message from '$lib/models/message.svelte';
    import Model from '$lib/models/model.svelte';
    import Session from '$lib/models/session.svelte';

    const session: Session = $derived(Session.find(Number(page.params.session_id)));
    const model: Model | undefined = $derived(
        Model.findBy({
            id: session.config.model,
            engineId: session.config.engineId,
        })
    );

    const sessions: Session[] = $derived(Session.where({ ephemeral: false }));
    const mcpServers: McpServer[] = $derived(McpServer.all());
    const engines: Engine[] = $derived(Engine.all());
    const hasModels = $derived(engines.flatMap(e => e.models).length > 0);

    let advancedIsOpen = $state(false);

    async function modelDidUpdate(model: Model) {
        session.config.model = model.id;
        session.config.engineId = model.engineId;
        await session.save();
    }

    async function startMcpServers(session: Session) {
        session.config.enabledMcpServers?.forEach(async name => {
            const server = mcpServers.find(s => s.name == name);

            if (server) {
                await startMcpServer(server);
            }
        });
    }

    async function startMcpServer(server: McpServer) {
        await server.start(session);
        await session.addMcpServer(server);
    }

    async function stopMcpServer(server: McpServer) {
        await server.stop(session);
        await session.removeMcpServer(server);
    }

    async function addSession() {
        const session = await Session.create({ appId: CHAT_APP_ID });
        await goto(`/chat/${session.id}`);
    }

    async function deleteSession(sess: Session) {
        if (!sess.id) return;

        await invoke('stop_session', { sessionId: sess.id });
        await Message.deleteBy({ sessionId: sess.id });
        await sess.delete();
        await goto(`/chat/${sessions[sessions.length - 1].id}`);
    }

    async function saveSession() {
        await session.save();
    }

    function toggleAdvanced() {
        advancedIsOpen = advancedIsOpen ? false : true;
    }

    function menuItems(session: Session): MenuItem[] {
        return [
            {
                label: 'Delete',
                style: 'text-red hover:bg-red hover:text-white',
                onclick: async () => await deleteSession(session),
            },
        ];
    }

    beforeNavigate(async () => {
        if (session) {
            await invoke('stop_session', { sessionId: session.id });
        }
    });

    afterNavigate(async () => {
        if (model?.supportsTools) {
            await startMcpServers(session);
        }
    });
</script>

{#snippet titlebar()}
    <Flex class="border-r-light z-10 h-full w-[300px] items-center border-r px-8 pr-4">
        <h1 class="grow font-[500]">Chat</h1>
        <button
            onclick={() => addSession()}
            class="border-light h-8 w-8 rounded-md border text-center
            font-mono leading-[4px] font-[10px] hover:cursor-pointer"
        >
            +
        </button>
    </Flex>
{/snippet}

{#snippet SessionItem(sess: Session)}
    <Flex
        class={`text-medium border-b-light w-full justify-between border-b 
                border-l-transparent text-sm ${sess.id == session?.id ? '!border-l-purple border-l' : ''}`}
    >
        <Menu items={menuItems(sess)}>
            <Link
                href={`/chat/${sess.id}`}
                class="w-full py-3 pl-8 text-left"
                activeClass="text-purple border-l border-l-purple"
                data-sveltekit-preload-data="off"
            >
                {sess.summary}
            </Link>
        </Menu>
    </Flex>
{/snippet}

<Layout {titlebar}>
    <Flex class="h-full items-start">
        <Flex class="border-light bg-medium h-content w-[300px] flex-col overflow-auto border-r">
            <List items={sessions} itemView={SessionItem} />
        </Flex>

        {#if session}
            <Flex class="bg-medium h-full w-[calc(100%-600px)] grow items-start">
                {#key session.id}
                    <Chat {session} {model} />
                {/key}
            </Flex>

            <Flex class="bg-medium border-light h-full w-[300px] flex-col items-start border-l p-4">
                {#key session.config.model}
                    <ModelMenu {engines} selected={model} onselect={modelDidUpdate} />
                {/key}

                {#if !hasModels}
                    <Flex class="text-red mb-8 w-full justify-center gap-2">
                        <Svg class="h-6 w-6" name="Warning" />
                        No engines connected
                    </Flex>
                {/if}

                {#if hasModels && !model}
                    <Flex class="text-red mb-8 w-full justify-center gap-2">
                        <Svg class="h-6 w-6" name="Warning" />
                        Model no longer exists
                    </Flex>
                {/if}

                {#if model && !model.supportsTools}
                    <Flex class="text-red w-full justify-start gap-2 pl-3">
                        <Svg class="h-6 w-6" name="Warning" />
                        Model doesn't support MCP
                    </Flex>
                {/if}

                <div class="mt-4">
                    {#each mcpServers as server (server.id)}
                        <Flex class="text-light z-0 mb-4 ml-2 flex-col items-start">
                            <Toggle
                                label={server.name}
                                value={session.hasMcpServer(server.name) && model?.supportsTools && server.isConfigured
                                    ? 'on'
                                    : 'off'}
                                disabled={!model?.supportsTools || !server.isConfigured}
                                onEnable={() => startMcpServer(server)}
                                onDisable={() => stopMcpServer(server)}
                            />
                            <div class="text-dark ml-8 mt-1 text-xs">
                                {server.transportType.toUpperCase()}
                                {#if server.transportType === 'http' && server.transportConfig?.url}
                                    - {server.transportConfig.url}
                                {:else if server.transportType === 'stdio' && server.command}
                                    - {server.command}
                                {/if}
                                {#if !server.isConfigured}
                                    <span class="text-red ml-2">(Not configured)</span>
                                {/if}
                            </div>
                        </Flex>
                    {/each}
                </div>

                <Flex class="mt-8 w-full flex-col items-start">
                    <button
                        class="text-dark mb-4 ml-2 self-start text-sm font-medium hover:cursor-pointer"
                        onclick={() => toggleAdvanced()}
                    >
                        Advanced <span class="ml-4">
                            {advancedIsOpen ? '⏷' : '⏵'}
                        </span>
                    </button>

                    {#if advancedIsOpen}
                        <Flex class="m-auto w-full flex-col items-start px-4 pt-4 pl-0">
                            <label for="ctx_num" class="text-medium mb-1 ml-2 text-sm">
                                Context Window Size
                            </label>
                            <input
                                name="ctx_num"
                                type="number"
                                autocomplete="off"
                                autocorrect="off"
                                class="border-light w-full rounded-lg border px-4 py-1 outline-none"
                                oninput={saveSession}
                                bind:value={session.config.contextWindow}
                            />

                            <label for="temperature" class="text-medium mt-4 mb-1 ml-2 text-sm">
                                Temperature
                            </label>

                            <Flex class="w-full pl-4">
                                <p>{session.config.temperature}</p>
                                <input
                                    name="temperature"
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    autocomplete="off"
                                    autocorrect="off"
                                    oninput={saveSession}
                                    class="bg-light ml-4 h-1 w-full appearance-none"
                                    bind:value={session.config.temperature}
                                />
                            </Flex>
                        </Flex>
                    {/if}
                </Flex>
            </Flex>
        {/if}
    </Flex>
</Layout>

<style>
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>
