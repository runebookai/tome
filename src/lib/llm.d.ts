export interface Request {
    model: string;
    stream: boolean;
    tools: Tool[];
    options: Options;
    messages: Message[];
}

export interface Response {
    created_at: string;
    done: boolean;
    done_reason: string;
    eval_count: number;
    eval_duration: number;
    load_duration: number;
    message: {
        content: string;
        role: Role;
        tool_calls: ToolCall[];
    };
    model: string;
    prompt_eval_count: number;
    prompt_eval_duration: number;
    total_duration: number;
}

export interface Options {
    num_ctx?: number;
    temperature?: number;
}

export interface Model {
    name: string;
    modifiedAt: string;
    size: number;
    digest: string;
    details: {
        parentModel: string;
        format: string;
        family: string;
        families: string[];
        parameter_size: string;
        quantization_level: string;
    };
    model_info: {
        "general.architecture": string;
        "general.file_type": number;
        "general.parameter_count": number;
        "general.quantization_version": number;
        "llama.attention.head_count": number;
        "llama.attention.head_count_kv": number;
        "llama.attention.layer_norm_rms_epsilon": number;
        "llama.block_count": number;
        "llama.context_length": number;
        "llama.embedding_length": number;
        "llama.feed_forward_length": number;
        "llama.rope.dimension_count": number;
        "llama.rope.freq_base": number;
        "llama.vocab_size": number;
        "tokenizer.ggml.bos_token_id": number;
        "tokenizer.ggml.eos_token_id": number;
        "tokenizer.ggml.merges": string[];
        "tokenizer.ggml.model": string;
        "tokenizer.ggml.pre": string;
        "tokenizer.ggml.token_type": string[];
        "tokenizer.ggml.tokens": string[];
    };
    capabilities?: string[];
}

export type Tag = Pick<Model, 'name' | 'modifiedAt' | 'size' | 'digest' | 'details'>;
export type Role = 'system' | 'tool' | 'user' | 'assistant';

export interface Tags {
    models: Tag[];
}

export interface Message {
    role: Role;
    content: string;
    name: string;
    tool_calls?: Record<string, any>; // eslint-disable-line
}

export interface ToolCall {
    function: {
        name: string;
        // We have no way of knowing what the LLM will pass
        // eslint-disable-next-line
        arguments: Record<string, any>;
    }
}

export interface Tool {
    type: string;
    function: {
        name: string;
        description: string;
        parameters: {
            type: string;
            required: string[];
            properties: Record<string, Property>;
        }
    }
}

interface Property {
    type: string;
    description: string;
}

