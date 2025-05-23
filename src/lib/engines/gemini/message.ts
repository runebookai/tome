import type { Content } from '@google/genai';

import { type IMessage, Session } from '$lib/models';

export default {
    from,
};

export function from(message: IMessage): Content | undefined {
    if (message.role == 'user') {
        return fromUser(message);
    } else if (message.role == 'assistant' && !message.content) {
        return fromToolCall(message);
    } else if (message.role == 'assistant') {
        return fromAssistant(message);
    } else if (message.role == 'tool') {
        return fromToolResponse(message);
    } else if (message.role == 'system') {
        return; // Gemini doesn't support System prompts
    } else {
        return fromAny(message);
    }
}

function fromUser(message: IMessage): Content {
    return {
        role: 'user',
        parts: [
            {
                text: message.content,
            },
        ],
    };
}

function fromAssistant(message: IMessage): Content {
    return {
        role: 'model',
        parts: [
            {
                text: message.content,
            },
        ],
    };
}

function fromToolCall(message: IMessage): Content | undefined {
    if (message.toolCalls.length == 0) {
        return;
    }

    return {
        role: 'model',
        parts: [
            {
                functionCall: {
                    id: message.toolCalls[0].id,
                    name: message.toolCalls[0].function.name,
                    args: message.toolCalls[0].function.arguments,
                },
            },
        ],
    };
}

function fromToolResponse(message: IMessage): Content {
    // Find the `toolCall` message for this response
    const session = Session.find(message.sessionId as number);
    const messages = Session.messages(session);
    const call = messages.flatMap(m => m.toolCalls).find(tc => tc.id == message.toolCallId);

    return {
        role: 'user',
        parts: [
            {
                functionResponse: {
                    name: call?.function.name,
                    response: {
                        result: message.content,
                    },
                },
            },
        ],
    };
}

function fromAny(message: IMessage): Content {
    return {
        role: message.role,
        parts: [
            {
                text: message.content,
            },
        ],
    };
}
