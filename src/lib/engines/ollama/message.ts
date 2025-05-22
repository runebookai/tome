import type { Message } from "ollama";

import type { IMessage } from "$lib/models/message";

export default {
    from,
}

export function from(message: IMessage): Message {
    return {
        role: message.role,
        content: message.content,
        tool_calls: message.toolCalls?.map(c => ({
            function: {
                name: c.function.name,
                arguments: c.function.arguments,
            }
        }))
    }
}
