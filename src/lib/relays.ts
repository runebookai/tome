import { Model, Relay } from '$lib/models';
import { error, info, warn } from '$lib/logger';

import { dispatch } from '$lib/dispatch';
import { fetch } from '$lib/http';

export interface RelayMessage {
    name: 'relay'
}

interface TelegramResponse {
    ok: boolean;
    result: TelegramUpdate[];
};

interface TelegramUpdate {
    update_id: number;
    message: TelegramMessage;
}

interface TelegramMessage {
    message_id: number;
    from: TelegramSender;
    chat: TelegramChat
    text: string;
    entities?: TelegramEntity[];
}

interface TelegramSender {
    id: number;
    is_bot: boolean;
}

interface TelegramChat {
    id: number;
    type: string;
}

interface TelegramEntity {
    type: string;
}

/**
 * Checks all Relays for new messages.
 *
 * This function checks all Relays for new messages and then processes any new
 * messages in the "background".
 */
export async function poll(): Promise<void> {
    const TELEGRAM_API = 'https://api.telegram.org/bot';
    const relays = Relay.all();

    relays.forEach(async (relay) => {
        const offset = relay.config.offset?? 0;
        const url = `${TELEGRAM_API}${relay.config.api_key}/getUpdates?offset=${offset}`
        // Get update
        const resp = await fetch(url);
        const payload  = await resp.json() as TelegramResponse;
        payload.result.forEach(async (update) => {
            info(`Update ID: ${update.update_id} :: ${update.message.text}`);
            // Increment offset for future updates
            if (update.update_id >= offset) {
                relay.config.offset = update.update_id + 1;
                relay.save();
            }

            // Check if the message is a bot message or a bot command
            if (update.message.from.is_bot || update.message.entities?.some(e => e.type == 'bot_command')) {
                return;
            };

            // Forward user messages to the Relay's Session, which will eventually ship them
            // back to the Telegram chat
            asyncRelayChat(relay, update);
        });
    });
}

/**
 * Asynchronously handle telegram req/resp
 *
 * This is a separate function so that we can call it _without_ `await`. That
 * way it can execute in the "background".
 *
 * @param relay Relay to communicate with
 * @param update TelegramUpdate object containing chat_id & user's message
 */
async function asyncRelayChat(relay: Relay, update: TelegramUpdate) {
    const modelId = relay.session?.config.model;
    if (!modelId) {
        warn(`No model configured for relay: ${relay.id}`);
        return
    }
    const model = Model.find(modelId);
    if (!model) {
        error(`MissingModelError in relay execution: ${relay.id}`);
        throw `MissingModelError in relay execution: ${relay.id}`;
    }

    const llm_response = await dispatch(relay.session, model, update.message.text);
    info(`LLM Response: ${llm_response.content}`);

    const TELEGRAM_API = 'https://api.telegram.org/bot';
    const url = `${TELEGRAM_API}${relay.config.api_key}/sendMessage?chat_id=${update.message.chat.id}&text=${encodeURIComponent(llm_response.content)}`
    const resp = await fetch(url);
    info(`Telegram Response: ${resp.text()}`);
}
