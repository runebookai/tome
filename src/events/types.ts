export interface MCPInstallEvent {
    config: string;
}

export interface FilesystemEvent<T> {
    id: number;
    data: T;
}

export interface FileCreatedEvent {
    paths: string;
}

export interface FileUpdatedEvent {
    paths: string;
}
