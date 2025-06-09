import { OpenAI } from 'openai';

import { Message } from '$lib/models';

export default {
    from,
};

export function from(message: Message): OpenAI.ChatCompletionMessageParam {
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

export function fromUser(message: Message): OpenAI.ChatCompletionUserMessageParam {
    return {
        role: 'user',
        content: message.content,
    };
}

export function fromAssistant(message: Message): OpenAI.ChatCompletionAssistantMessageParam {
    return {
        role: 'assistant',
        content: message.content,
        tool_calls: toolCalls(message),
    };
}

export function fromTool(message: Message): OpenAI.ChatCompletionToolMessageParam {
    return {
        tool_call_id: message.toolCallId as string,
        role: 'tool',
        content: message.content,
    };
}

export function fromSystem(message: Message): OpenAI.ChatCompletionSystemMessageParam {
    return {
        role: 'system',
        content: message.content,
    };
}

function toolCalls(message: Message): OpenAI.ChatCompletionMessageToolCall[] | undefined {
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
