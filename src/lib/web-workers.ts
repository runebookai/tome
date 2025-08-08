/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-function-type */

/**
 * # Web Workers
 *
 * Web Workers are effectively separate processes/threads running in the
 * browser. As such, they way you communicate with them is through a, sort of,
 * PIPE interface. Specifically, `postMessage` and `onmessage`.
 *
 * This module exposes functions to make that a little easier, while emulating
 * Tauri's IPC functions – notably `invoke`.
 *
 * ## Spawning a Web Worker
 *
 * Web Workers are scripts that get executed by the browser. We execute them as
 * a `module` so that normal `import` statements work.
 *
 * @example
 *
 * ```ts
 * // $lib/workers/log.ts
 * console.log('Hello from a web worker');
 *
 * // $lib/whatever.ts
 * import logWorkerPath from '$lib/workers/log?url';
 * import { spawn } from '$lib/web-workers';
 * spawn(logWorkerPath);
 * ```
 */

import { info } from '$lib/logger';

/**
 * `invoke`-able command function type
 */
export type InvokeFn<T> = (args: T) => void;

/**
 * Exposed commands accessible to web workers via `invoke`;
 */
const commands: Record<string, Function> = {};

/**
 * All messages sent from the Worker to the parent thread MUST have an `event`
 * property.
 *
 * This property is routed to a function by the same name, in the `WebWorker`
 * subclass. This is the main means of communication between the "threads".
 */
export interface InvokeMessage {
    name: string;
    [key: string]: any;
}

/**
 * Start a Web Worker.
 */
export function spawn(path: string): Worker {
    const worker = new Worker(path, { type: 'module' });
    worker.onmessage = (message: MessageEvent<InvokeMessage>) => {
        const { name, ...args } = message.data;
        info(`→ invoke('${name}', ${JSON.stringify(args)})`);
        commands[name](args);
    };
    return worker;
}

/**
 * Define a function that's made available to Web Workers via `invoke`.
 */
export function command<T extends object>(name: string, fn: InvokeFn<T>) {
    commands[name] = fn;
}

/**
 * Invoke a function in the parent thread, from a Web Worker.
 */
export function invoke(name: string, ...args: any[]) {
    postMessage({ name, ...args });
}
