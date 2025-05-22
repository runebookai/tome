/* eslint-disable @typescript-eslint/no-explicit-any */

// Delay the execution of something until the event that triggers it, stops.
//
// Useful for keypress events you want to run when the user stops typing for
// some period of time.
//
// @example
// ```ts
// <input onkeyup={debounce(doThing)} />
// ```
//
export function debounce(fn: (...args: any[]) => any, timeout = 250) {
    let timer: number | undefined;

    return (...args: any[]) => {
        clearTimeout(timer);

        timer = setTimeout(() => {
            fn(...args);
        }, timeout) as unknown as number;
    };
}

// Run a function when a specific key is pressed.
//
// @example
// ```ts
// function submit(e: KeyboardEvent) {
//     coolSubmitStuff();
// }
//
// <input onkeypress={onkey('Enter', submit)} />
// ```
//
export function onkey(key: string, fn: (e: KeyboardEvent) => any) {
    return (e: KeyboardEvent) => {
        if (e.key == key) {
            fn(e);
        }
    };
}
