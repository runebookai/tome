export interface CheckboxEvent extends Event {
    currentTarget: EventTarget & HTMLInputElement;
}

export interface ButtonEvent extends MouseEvent {
    currentTarget: EventTarget & HTMLButtonElement;
}
