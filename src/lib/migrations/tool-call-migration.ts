import uuid4 from 'uuid4';

import { Message } from '$lib/models';

export async function migrate() {
    await Promise.all(
        Message.all().map(async message => {
            if (message.toolCalls.length == 0) {
                return;
            }

            await Promise.all(
                message.toolCalls.map(async tc => {
                    // Ollama tool calls didn't always have an `id`. Add one
                    // now if that's the case.
                    if (!tc.id) {
                        tc.id = uuid4();
                        await message.save();
                    }

                    // Tool responses are always the following message
                    const response = Message.find(Number(message.id) + 1);
                    response.toolCallId = tc.id;
                    await response.save();
                })
            );
        })
    );
}
