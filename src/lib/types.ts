export enum Interface {
    Voice = "Voice",
    Chat = "Chat",
    Dashboard = "Dashboard",
    Daemon = "Daemon",
}

export enum NodeType {
    Context = "Context",
}

export interface CheckboxEvent extends Event {
    currentTarget: EventTarget & HTMLInputElement;
}
