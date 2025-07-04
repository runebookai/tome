import { invoke } from '@tauri-apps/api/core';
import uuid4 from 'uuid4';

import type { Options } from '$lib/engines/types';
import { error } from '$lib/logger';
import { App, Engine, Message, Model, Session } from '$lib/models';

export async function dispatch(session: Session, model: Model, prompt?: string): Promise<Message> {
    const app = App.find(session.appId as number);
    const engine = Engine.find(Number(model.engineId));

    if (!engine || !engine.client) {
        error(`MissingEngineError`, model.id);
        throw `MissingEngineError: ${model.id}`;
    }

    if (!app) {
        error(`MissingAppError`, session.appId);
        throw `MissingAppError: ${session.appId}`;
    }

    if (prompt) {
        await session.addMessage({
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
        session.messages,
        await session.tools(),
        options
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

            await session.addMessage({
                role: 'assistant',
                content: '',
                toolCalls: [call],
            });

            await session.addMessage({
                role: 'tool',
                content,
                toolCallId: call.id,
            });

            return await dispatch(session, model);
        }
    }

    message.model = String(model.id);
    message.sessionId = session.id;
    await message.save();

    return message;
}
