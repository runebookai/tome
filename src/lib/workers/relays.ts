import { invoke } from '$lib/web-workers';

/**
 * Invoke the parent thread to process messages from a Telegram users.
 */
function relay() {
    invoke('relay');
    enqueue();
}

/**
 * Set timeout before checking for new messages
 */
function enqueue() {
    const delay = 10_000;
    setTimeout(relay, delay);
}

enqueue();
