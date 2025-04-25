<script lang="ts">
	import { invoke } from '@tauri-apps/api/core';
	import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';

	import { CHAT_APP_ID } from '$lib/const';
	import Chat from '$components/Chat.svelte';
	import Flex from '$components/Flex.svelte';
	import Layout from '$components/Layouts/Default.svelte';
	import Menu from '$components/Menu.svelte';
	import Select from '$components/Select.svelte';
	import Svg from '$components/Svg.svelte';
	import Toggle from '$components/Toggle.svelte';
	import McpServer, { type IMcpServer } from '$lib/models/mcp-server';
	import Message from '$lib/models/message';
	import Model, { type IModel } from '$lib/models/model.svelte';
	import Session, { type ISession } from '$lib/models/session';

	const session: ISession = $derived(Session.find(page.params.session_id));
	const model: IModel = $derived(Model.find(session.config.model));

	const sessions: ISession[] = $derived(Session.all());
	const mcpServers: IMcpServer[] = $derived(McpServer.all());
	const models: IModel[] = $derived(Model.all());

	async function modelDidUpdate() {
		await Session.update(session);
	}

	async function startMcpServers(session: ISession) {
		session.config.enabledMcpServers.forEach(async (name) => {
			const server = mcpServers.find((s) => McpServer.name(s) == name);

			if (server) {
				await startMcpServer(server);
			}
		});
	}

	async function startMcpServer(server: IMcpServer) {
		await McpServer.start(server, session);
		await Session.addMcpServer(session, server);
	}

	async function stopMcpServer(server: IMcpServer) {
		await McpServer.stop(server, session);
		await Session.removeMcpServer(session, server);
	}

	async function addSession() {
		const sess = await Session.create({ appId: CHAT_APP_ID });
		await goto(`/chat/${sess.id}`);
	}

	async function deleteSession(sess: ISession) {
		if (!sess.id) return;

		await invoke('stop_session', { sessionId: sess.id });
		await Message.deleteBy({ session_id: sess.id });
		await Session.delete(sess.id as number);

		if (!session) {
			await goto(`/chat/${sessions[sessions.length - 1].id}`);
		}
	}

	beforeNavigate(async () => {
		if (session) {
			await invoke('stop_session', { sessionId: session.id });
		}
	});

	afterNavigate(async () => {
		if (model.capabilities?.includes('tools')) {
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

<Layout {titlebar}>
	{#if session}
		<Flex class="h-full">
			<Flex class="border-light bg-medium h-full w-[300px] flex-col border-r">
				{#each sessions as sess (sess.id)}
					<Flex
						class={`group text-medium border-b-light w-full justify-between border-b 
                        border-l-transparent pr-4 text-sm 
                        ${sess.id == session?.id ? '!border-l-purple border-l' : ''}`}
					>
						<a
							href={`/chat/${sess.id}`}
							class:text-purple={sess.id == session.id}
							class="w-full max-w-[220px] py-3 pl-8 text-left hover:cursor-pointer"
							data-sveltekit-preload-data="off"
						>
							<p class="overflow-hidden text-ellipsis whitespace-nowrap">
								{sess.summary}
							</p>
						</a>

						<Menu
							items={[
								{
									icon: 'Delete',
									label: 'Delete',
									onclick: async () => await deleteSession(sess),
									style: 'text-red',
								},
							]}
						/>
					</Flex>
				{/each}
			</Flex>

			<Flex class="bg-medium h-full w-[calc(100%-600px)] grow items-start">
				{#key session.id}
					<Chat {session} model={session.config.model} />
				{/key}
			</Flex>

			<Flex class="bg-medium border-light h-full w-[300px] flex-col items-start border-l p-4">
				<Select
					onSelect={modelDidUpdate}
					bind:value={session.config.model}
					class="text-light z-50 mb-8 w-full"
					options={models.map((m) => m.name)}
				/>

				{@const supportsTools = model.capabilities?.includes('tools')}

				{#if !Model.supportsTools(model)}
					<Flex class="text-red mb-8 w-full justify-center gap-2">
						<Svg class="h-6 w-6" name="Warning" />
						Doesn't support tools
					</Flex>
				{/if}

				{#each mcpServers as server (server.id)}
					{@const name = McpServer.name(server)}

					<Flex class="text-light z-0 mb-4 ml-2">
						<Toggle
							label={name}
							value={Session.hasMcpServer(session, name) && Model.supportsTools(model)
								? 'on'
								: 'off'}
							disabled={!supportsTools}
							onEnable={() => startMcpServer(server)}
							onDisable={() => stopMcpServer(server)}
						/>
					</Flex>
				{/each}
			</Flex>
		</Flex>
	{/if}
</Layout>
