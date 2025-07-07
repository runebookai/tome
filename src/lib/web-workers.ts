/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-function-type */

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
        commands[name](args);
    };
    return worker;
}

/**
 * Define a function that's made available to Web Workers via `invoke`.
 */
export function command<T extends object>(fn: InvokeFn<T>) {
    if (!fn.name) throw 'CommandError: function must have a name';
    commands[fn.name] = fn;
}

/**
 * Invoke a function in the parent thread, from a Web Worker.
 */
export function invoke(name: string, ...args: any[]) {
    postMessage({ name, ...args });
}
