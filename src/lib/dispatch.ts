import { invoke } from "@tauri-apps/api/core";
import uuid4 from "uuid4";

import type { Options } from "$lib/engines/types";
import { error } from "$lib/logger";
import App from "$lib/models/app";
import Engine from "$lib/models/engine";
import type { IMessage } from "$lib/models/message";
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

    const options: Options = {
        num_ctx: session.config.contextWindow,
        temperature: session.config.temperature,
    };

    const message = await engine.client.chat(
        model,
        Session.messages(session),
        await Session.tools(session),
        options,
    );

    if (message.toolCalls?.length) {
        for (const call of message.toolCalls) {
            // Some engines, like Ollama, don't give tool calls a unique
            // identifier. In those cases, do it ourselves, so that future
            // calls to engines that do (like OpenAI), don't explode because
            // they expect one to be set.
            call.id ||= uuid4();

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
                toolCallId: call.id,
            });

            return await dispatch(session, model);
        }
    }

    await Session.addMessage(session, {
        ...message,
        model: model.id,
    });

    return message;
}
