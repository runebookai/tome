import { invoke } from "@tauri-apps/api/core";

import { info } from "$lib/logger";

type Response<T> = globalThis.Response | T | undefined;

interface Options extends RequestInit {
    url?: string;
    raw?: boolean;
    raise?: boolean;
}

export abstract class HttpClient {
    options: Options = {};

    abstract get url(): string;

    constructor(options: Options = {}) {
        this.options = { ...this.options, ...options };
    }

    async get<T>(uri: string, options: Options = {}): Promise<Response<T>> {
        const raw = Object.remove(options, 'raw');
        const raise: boolean | undefined = Object.remove(options, 'raise');
        const response = await this.request(uri, { ...options, method: 'GET' });
        return raw ? response : await this.parse(response, raise);
    }

    async post<T>(uri: string, options: Options = {}): Promise<Response<T>> {
        const raw = Object.remove(options, 'raw');
        const raise: boolean | undefined = Object.remove(options, 'raise');
        const response = await this.request(uri, { ...options, method: 'POST' });
        return raw ? response : await this.parse(response, raise);
    }

    async put<T>(uri: string, options: Options = {}): Promise<Response<T>> {
        const raw = Object.remove(options, 'raw');
        const raise: boolean | undefined = Object.remove(options, 'raise');
        const response = await this.request(uri, { ...options, method: 'PUT' });
        return raw ? response : await this.parse(response, raise);
    }

    async delete<T>(uri: string, options: Options = {}): Promise<Response<T>> {
        const raw = Object.remove(options, 'raw');
        const raise: boolean | undefined = Object.remove(options, 'raise');
        const response = await this.request(uri, { ...options, method: 'DELETE' });
        return raw ? response : await this.parse(response, raise);
    }

    async head<T>(uri: string, options: Options = {}): Promise<Response<T>> {
        const raw = Object.remove(options, 'raw');
        const raise: boolean | undefined = Object.remove(options, 'raise');
        const response = await this.request(uri, { ...options, method: 'HEAD' });
        return raw ? response : await this.parse(response, raise);
    }

    async parse<T>(response: globalThis.Response, raise: boolean = true): Promise<T | undefined> {
        try {
            return await response.json() as T;
        } catch (error) {
            if (raise) {
                throw error;
            }
        }
    }

    async request(uri: string, options: Options = {}): Promise<globalThis.Response> {
        let response: globalThis.Response | undefined;

        const url = Object.remove(options, 'url') || this.url;
        const opt = { ...this.options, ...options };

        try {
            const resp: globalThis.Response = await invoke('fetch', { url: `${url}${uri}`, options: opt });
            const { body, ...init } = resp;
            response = new globalThis.Response(body, init);
        } catch (err) {
            if (typeof err == 'string') {
                info(`${opt.method} ${url}${uri}: ${err}`);
                return this.response(500);
            } else if (err instanceof Error) {
                if (err.name == 'TimeoutError') {
                    info(`${opt.method} ${url}${uri}: 408 Timeout`)
                    return this.response(408);
                } else {
                    info(`${opt.method} ${url}${uri}: ${err.name}: ${err.message}`, err.stack);
                    return this.response(500);
                }
            }
        }

        if (!response) {
            return this.response(500);
        }

        if (response.status > 399) {
            info(`${opt.method} ${url}${uri}: ${response.status} ${response.statusText}`);
        }

        info(`${opt.method} ${url}${uri}: ${response.status} ${response.statusText}`);

        return response;
    }

    response(status: number = 500, body?: string): globalThis.Response {
        return new globalThis.Response(body, { status });
    }
}
