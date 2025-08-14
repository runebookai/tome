import moment from 'moment';

import { info } from '$lib/logger';
import { invoke } from '$lib/web-workers';

/**
 * Invoke the parent thread to process all Scheduled Tasks.
 */
function tick() {
    invoke('tick');
    enqueue();
}

/**
 * Enqueue a tick for the next time we need to process things, based on the
 * schedule.
 */
function enqueue() {
    info(`next tick: ${moment.utc().add(delay(), 'milliseconds')}`);
    setTimeout(tick, delay());
}

/**
 * Determine the top of the next hour.
 */
function delay() {
    return moment.utc().startOf('hour').add(1, 'hour').diff(moment.utc(), 'milliseconds');
}

enqueue();
