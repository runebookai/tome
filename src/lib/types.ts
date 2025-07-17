export interface CheckboxEvent extends Event {
    currentTarget: EventTarget & HTMLInputElement;
}

export interface ButtonEvent extends MouseEvent {
    currentTarget: EventTarget & HTMLButtonElement;
}

export interface Json {
    [x: string]: string | number | boolean | Date | Json | Array<Json>;
}
