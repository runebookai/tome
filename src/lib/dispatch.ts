import { invoke } from "@tauri-apps/api/core";

import type { Options } from "$lib/engines/types";
import { error } from "$lib/logger";
import App from "$lib/models/app";
import Engine from "$lib/models/engine";
import Message, { type IMessage } from "$lib/models/message";
import type { IModel } from "$lib/models/model";
import Session, { type ISession } from "$lib/models/session";

export async function dispatch(session: ISession, model: IModel, prompt?: string): Promise<IMessage> {
    const app = App.find(session.appId as number);
    const engine = Engine.fromModelId(model.id);

    if (!engine) {
        error(`MissingEngineError`, model.id);
        throw `MissingEngineError: ${model.id}`;
    }

    if (!app) {
        error(`MissingAppError`, session.appId);
        throw `MissingAppError: ${session.appId}`;
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

    const options: Options = {
        num_ctx: session.config.contextWindow,
        temperature: session.config.temperature,
    };

    const message = await engine.client.chat(
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

            const toolCall = await Session.addMessage(session, {
                role: 'assistant',
                content: '',
                toolCalls: [call],
            });

            const response = await Session.addMessage(session, {
                role: 'tool',
                content,
                name: call.function.name,
            });

            toolCall.responseId = response.id;
            await Message.save(toolCall);

            return await dispatch(session, model);
        }
    }

    await Session.addMessage(session, message);

    return message;
}
