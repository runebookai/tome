/* eslint-disable @typescript-eslint/no-explicit-any */

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }

    // Utility type for plain, unknown-value, JS Objects
    type Obj = { [key: string]: any };

    interface ObjectConstructor {
        compact<T>(o: Obj): T;
        without<T>(o: Obj, keys: string[]): T;
        remove<T>(o: Obj, key: string): T | undefined;
        map<T extends Obj>(o: T, fn: (key: string, value: any) => any): T;
    }

    interface Array<T> {
        sortBy<T extends Obj>(key: string): Array<T>;
        findBy<T extends Obj>(key: string, value: any): T | undefined;
        compact(): Array<Exclude<T, undefined>>;
    }

    interface CheckboxEvent extends Event {
        currentTarget: EventTarget & HTMLInputElement;
    }

    interface SpeechRecognitionEvent {
        results: SpeechRecognitionResult[];
    }
}

declare module 'svelte/elements' {
    interface HTMLTextareaAttributes {
        autocorrect: 'on' | 'off';
    }
}

export {};
