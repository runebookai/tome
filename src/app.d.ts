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
    type Obj = { [key: string]: any }; // eslint-disable-line

    interface ObjectConstructor {
        compact<T>(o: Obj): T;
        without<T>(o: Obj, keys: string[]): T;
        remove<T>(o: Obj, key: string): T | undefined;
    }

    interface Array<T> {
        sortBy(key: string): Array<T>;
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
        autocorrect: "on" | "off";
    }
}

export { };
