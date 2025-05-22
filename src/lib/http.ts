import { invoke } from '@tauri-apps/api/core';
import type { RequestInit } from 'openai/_shims/web-types.mjs';

import { info } from '$lib/logger';

type Response<T> = globalThis.Response | T | undefined;

export interface HttpOptions extends RequestInit {
    url?: string;
    raw?: boolean;
    raise?: boolean;
    timeout?: number;
}

export async function fetch(url: string | URL | Request, options?: RequestInit) {
    const response: globalThis.Response = await invoke('fetch', { url, options });
    const { body, ...init } = response;
    return new globalThis.Response(body, init);
}

export abstract class HttpClient {
    options: HttpOptions = {};

    abstract get url(): string;

    constructor(options: HttpOptions = {}) {
        this.options = { ...this.options, ...options };
    }

    async get<T>(uri: string, options: HttpOptions = {}): Promise<Response<T>> {
        const raw = Object.remove(options, 'raw');
        const raise: boolean | undefined = Object.remove(options, 'raise');
        const response = await this.request(uri, { ...options, method: 'GET' });
        return raw ? response : await this.parse(response, raise);
    }

    async post<T>(uri: string, options: HttpOptions = {}): Promise<Response<T>> {
        const raw = Object.remove(options, 'raw');
        const raise: boolean | undefined = Object.remove(options, 'raise');
        const response = await this.request(uri, { ...options, method: 'POST' });
        return raw ? response : await this.parse(response, raise);
    }

    async put<T>(uri: string, options: HttpOptions = {}): Promise<Response<T>> {
        const raw = Object.remove(options, 'raw');
        const raise: boolean | undefined = Object.remove(options, 'raise');
        const response = await this.request(uri, { ...options, method: 'PUT' });
        return raw ? response : await this.parse(response, raise);
    }

    async delete<T>(uri: string, options: HttpOptions = {}): Promise<Response<T>> {
        const raw = Object.remove(options, 'raw');
        const raise: boolean | undefined = Object.remove(options, 'raise');
        const response = await this.request(uri, { ...options, method: 'DELETE' });
        return raw ? response : await this.parse(response, raise);
    }

    async head<T>(uri: string, options: HttpOptions = {}): Promise<Response<T>> {
        const raw = Object.remove(options, 'raw');
        const raise: boolean | undefined = Object.remove(options, 'raise');
        const response = await this.request(uri, { ...options, method: 'HEAD' });
        return raw ? response : await this.parse(response, raise);
    }

    async parse<T>(response: globalThis.Response, raise: boolean = true): Promise<T | undefined> {
        try {
            return (await response.json()) as T;
        } catch (error) {
            if (raise) {
                throw error;
            }
        }
    }

    async request(uri: string, options: HttpOptions = {}): Promise<globalThis.Response> {
        let response: globalThis.Response | undefined;

        const url = Object.remove(options, 'url') || this.url;
        const opt = { ...this.options, ...options };

        try {
            response = await fetch(`${url}${uri}`, opt);
        } catch (err) {
            if (typeof err == 'string') {
                info(`${opt.method} ${url}${uri}: ${err}`);
                return this.response(500);
            } else if (err instanceof Error) {
                if (err.name == 'TimeoutError') {
                    info(`${opt.method} ${url}${uri}: 408 Timeout`);
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
