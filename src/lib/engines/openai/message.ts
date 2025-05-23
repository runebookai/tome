import { OpenAI } from 'openai';

import type { IMessage } from '$lib/models/message';

export default {
    from,
};

export function from(message: IMessage): OpenAI.ChatCompletionMessageParam {
    if (message.role == 'assistant') {
        return fromAssistant(message);
    } else if (message.role == 'system') {
        return fromSystem(message);
    } else if (['tool', 'function'].includes(message.role)) {
        return fromTool(message);
    } else {
        return fromUser(message);
    }
}

export function fromUser(message: IMessage): OpenAI.ChatCompletionUserMessageParam {
    return {
        role: 'user',
        content: message.content,
    };
}

export function fromAssistant(message: IMessage): OpenAI.ChatCompletionAssistantMessageParam {
    return {
        role: 'assistant',
        content: message.content,
        tool_calls: toolCalls(message),
    };
}

export function fromTool(message: IMessage): OpenAI.ChatCompletionToolMessageParam {
    return {
        tool_call_id: message.toolCallId as string,
        role: 'tool',
        content: message.content,
    };
}

export function fromSystem(message: IMessage): OpenAI.ChatCompletionSystemMessageParam {
    return {
        role: 'system',
        content: message.content,
    };
}

function toolCalls(message: IMessage): OpenAI.ChatCompletionMessageToolCall[] | undefined {
    if (message.toolCalls.length == 0) {
        return;
    }

    return message.toolCalls.map(call => ({
        id: call.id as string,
        type: 'function',
        function: {
            name: call.function.name,
            arguments: JSON.stringify(call.function.arguments),
        },
    }));
}
