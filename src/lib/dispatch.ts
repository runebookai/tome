import { invoke } from "@tauri-apps/api/core";

import * as llm from "$lib/llm";
import App from "$lib/models/app";
import type { IMessage } from "$lib/models/message";
import Session, { type ISession } from "$lib/models/session";

export async function dispatch(session: ISession, model: string, prompt?: string): Promise<IMessage> {
    const app = App.find(session.appId as number);
    const client = new llm.Client();

    if (!app) {
        throw "Missing app";
    }

    if (prompt) {
        await Session.addMessage(session, {
            role: 'user',
            content: prompt,
        });
    }

    const messages = (Session.messages(session)).map(m => ({
        role: m.role,
        content: m.content,
        name: m.name,
        tool_calls: m.toolCalls,
    }));

    const options: llm.Options = {
        num_ctx: session.config.contextWindow,
        temperature: session.config.temperature,
    };

    const message = await client.chat(
        model,
        messages,
        await Session.tools(session),
        options,
    );

    if (message.toolCalls?.length) {
        for (const call of message.toolCalls) {
            const content: string = await invoke('call_mcp_tool', {
                sessionId: session.id,
                name: call.function.name,
                arguments: call.function.arguments,
            });

            await Session.addMessage(session, {
                role: 'assistant',
                content: '',
                toolCalls: [call],
            });

            await Session.addMessage(session, {
                role: 'tool',
                content,
                name: call.function.name,
            });

            return await dispatch(session, model);
        }
    }

    await Session.addMessage(session, message);

    return message;
}
