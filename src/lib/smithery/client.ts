import { HttpClient } from '$lib/http';
import type { CompactServer, Server, ServerList } from '$lib/smithery/types';

export class Client extends HttpClient {
    options: RequestInit = {
        signal: AbortSignal.timeout(30000),
        headers: {
            Authorization: 'Bearer 4f91ed5c-d3ae-4ba6-9169-10455db2e626',
        },
    };

    get url() {
        return 'https://registry.smithery.ai';
    }

    async servers(page: number = 1): Promise<CompactServer[]> {
        return (
            (await this.get(`/servers?q=is:local&pageSize=24&page=${page}`)) as ServerList
        ).servers.filter(s => Number(s.useCount) > 0);
    }

    async server(name: string): Promise<Server> {
        return (await this.get(`/servers/${name}`)) as Server;
    }

    async search(query: string): Promise<CompactServer[]> {
        const q = encodeURIComponent(query).replace(/%20/g, '+');

        return ((await this.get(`/servers?q=is:local+${q}`)) as ServerList).servers.filter(
            s => Number(s.useCount) > 0
        );
    }
}
