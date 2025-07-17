import { Engine, Message, Model, Session } from '$lib/models';

/**
 * Default summary before summarization via LLM.
 */
export const DEFAULT_SUMMARY = 'Untitled';

/**
 * Prompt to retrieve a summary of the conversation so far.
 */
export const SUMMARY_PROMPT =
    'Summarize all previous messages in a concise and comprehensive manner. The summary can be 3 words or less. Only respond with the summary and nothing else. Remember, the length of the summary can be 3 words or less.';

function isSummarizable(session: Session) {
    return (
        session.id &&
        session.config.model &&
        session.config.engineId &&
        session.hasUserMessages() &&
        session.summary == DEFAULT_SUMMARY &&
        Engine.exists({ id: session.config.engineId }) &&
        Model.exists({ id: session.config.model, engineId: session.config.engineId })
    );
}

/**
 * Summarize a chat session by prompting the LLM to do so.
 */
export async function summarize(session: Session) {
    if (!isSummarizable(session)) {
        return;
    }

    const engine = Engine.find(session.config.engineId as number);
    const model = Model.findBy({ engineId: engine.id, id: session.config.model }) as Model;

    const message = (await engine.client?.chat(model, [
        ...session.messages,
        {
            role: 'user',
            content: SUMMARY_PROMPT,
        } as Message,
    ])) as Message;

    session.summary = message.content
        // Some smaller models add extra explanation after a ";"
        .split(';')[0]
        // They will often prefix the response with "summary:"
        .split(/[Ss]ummary: /)
        .pop() as string;

    session.save();
}
