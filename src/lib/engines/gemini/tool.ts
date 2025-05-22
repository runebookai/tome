import { type FunctionDeclaration, type ToolListUnion, Type } from '@google/genai';

import type { Tool } from '$lib/engines/types';

/**
 * Transform canonical Tool(s) into a Gemini-specific shape.
 *
 * The Gemini library uses specific enums and values for certain fields, so we
 * need to convert our canonical (from `lib/engines/types`) objects into what
 * the Gemini expects.
 *
 * @example
 * ```ts
 * import type { Tool } from '$lib/engines/types';
 * import GeminiTools from '$lib/engines/gemini/tool';
 *
 * const tool = {...} as Tool;
 *
 * GeminiTools.from([tool]);
 * // => [<FunctionDeclaration>]
 *
 * GeminiTools.from(tool);
 * // => [<FunctionDeclaration>]
 * ```
 */
function from(tools: Tool | Tool[]): ToolListUnion {
    return [
        {
            functionDeclarations: Array.isArray(tools) ? fromMany(tools) : [fromOne(tools)],
        },
    ];
}

function fromMany(tools: Tool[]): FunctionDeclaration[] {
    return tools.map((tool) => fromOne(tool));
}

function fromOne(tool: Tool): FunctionDeclaration {
    const properties = Object.map(tool.function.parameters.properties, (name, prop) => [
        name,
        {
            ...prop,
            type: toGeminiType(prop.type),
        },
    ]);

    return {
        ...tool.function,
        parameters: {
            ...tool.function.parameters,
            type: Type.OBJECT,
            properties,
        },
    } as FunctionDeclaration;
}

function toGeminiType(type: string): Type {
    return (
        {
            string: Type.STRING,
            number: Type.NUMBER,
            boolean: Type.BOOLEAN,
            integer: Type.INTEGER,
            array: Type.ARRAY,
            object: Type.OBJECT,
        }[type] || Type.STRING
    );
}

export default {
    from,
};
