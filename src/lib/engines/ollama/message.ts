import type { Message as OllamaMessage } from 'ollama';

import { Message } from '$lib/models';

export default {
    from,
};

export function from(message: Message): OllamaMessage {
    return {
        role: message.role,
        content: message.content,
        tool_calls: message.toolCalls?.map(c => ({
            function: {
                name: c.function.name,
                arguments: c.function.arguments,
            },
        })),
    };
}
