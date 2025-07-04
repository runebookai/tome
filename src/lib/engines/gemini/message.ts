import type { Content } from '@google/genai';

import { Message, Session } from '$lib/models';

export default {
    from,
};

export function from(message: Message): Content | undefined {
    if (message.role == 'user') {
        return fromUser(message);
    } else if (message.role == 'assistant' && !message.content) {
        return fromToolCall(message);
    } else if (message.role == 'assistant') {
        return fromAssistant(message);
    } else if (message.role == 'tool') {
        return fromToolResponse(message);
    } else if (message.role == 'system') {
        return;
    } else {
        return fromAny(message);
    }
}

function fromUser(message: Message): Content {
    return {
        role: 'user',
        parts: [
            {
                text: message.content,
            },
        ],
    };
}

function fromAssistant(message: Message): Content {
    return {
        role: 'model',
        parts: [
            {
                text: message.content,
            },
        ],
    };
}

function fromToolCall(message: Message): Content | undefined {
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

function fromToolResponse(message: Message): Content {
    // Find the `toolCall` message for this response
    const session = Session.find(message.sessionId as number);
    const call = session.messages.flatMap(m => m.toolCalls).find(tc => tc.id == message.toolCallId);

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

function fromAny(message: Message): Content {
    return {
        role: message.role,
        parts: [
            {
                text: message.content,
            },
        ],
    };
}
