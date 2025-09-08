import type { Event as TauriEvent } from '@tauri-apps/api/event';

export type Event<T> = TauriEvent<FilesystemEvent<T>>;

export interface FilesystemEvent<T> {
    id: number;
    data: T;
}

export interface MCPInstallEvent {
    config: string;
}

export interface FileCreatedEvent {
    paths: string;
}

export interface FileUpdatedEvent {
    paths: string;
}

export interface RelayEvent {
    data: string;
}

export interface AppInstallEvent {
    hash: string;
}
