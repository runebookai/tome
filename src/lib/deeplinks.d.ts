export interface InstallMcpServerPayload {
    command: string;
    args: string[];
    env: Record<string, string>;
}
