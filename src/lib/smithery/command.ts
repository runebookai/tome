import ts from 'typescript';

import type { Server } from '$lib/smithery';

const IS_CONFIG = /^(\s*config\.)(.+)$/;

// A Node is an object that knows how to be evaluated using a `config` object
// which may contain values to be interpolated.
//
abstract class Node {
    text: string;
    abstract eval(config: Record<string, string>): string;

    constructor(text: string) {
        this.text = text.trim().replaceAll("'", '');
    }
}

// No interpolation, just a regular string.
//
// `text` is the value.
//
class StringNode extends Node {
    eval(_: Record<string, string>) {
        return this.text;
    }
}

// Gets its value from the config object passed in.
//
// `text` is the name of the key in `config`.
//
class ConfigNode extends Node {
    eval(config: Record<string, string>): string {
        return config[this.text];
    }
}

// Parent object that wraps a sets of `Node`s and can give us the final
// `Config` using those `Node`s.
//
export class Config {
    command: StringNode;
    args: Node[];
    env: Record<string, Node>;

    static from(server: Server) {
        return parse(server);
    }

    constructor() {
        this.command = new StringNode('');
        this.args = [];
        this.env = {};
    }

    eval(config: Record<string, string>) {
        return {
            command: this.command.eval(config),
            args: this.args.map(a => a.eval(config)),
            env: Object.fromEntries(
                Object.entries(this.env).map(([k, v]) => [k, v.eval(config)])
            ),
        }
    }
}

// Parse out the start command of an MCP server, from Smithery's configuration
// file syntax.
//
// Smithery's JSON schema for MCP servers involves specifying a JS function
// that evaluates into the final config object used to start the server
// process.
//
// ```
// startCommand:
//     ...
//     commandFunction:
//         |-
//         (config) => ({
//             "command" => "npx",
//             "args" => ["an-mcp-server", "--apiKey", config.apiKey],
//             "env": {
//                 OTHER_THING: config.otherThing
//             }
//         })
// ```
//
// This seems like a supremely bad idea, since it means `eval`ing arbitrary,
// user-supplied, code. Likely on a server, since it's the parts necessary to
// spawn a process. I could totally be missing something, though. so :shrug:
//
// In any case, we're not going to `eval` anything. Instead, we build an AST of
// this code and parse out the nodes we care about. We build a `Config` object
// that will then be "evaluated" later, when we have the values we need to
// interpolate.
//
// This approach avoids any dangers of executing arbitrary code.
//
function parse(server: Server): Config {
    const stdio = server.connections.find(c => c.type == 'stdio');
    const cmd = stdio?.stdioFunction || '';
    const config: Config = new Config();

    // Build an AST from the function declaration
    const source = ts.createSourceFile(
        "source.ts",
        cmd,
        ts.ScriptTarget.Latest,
        true,
    );

    // Relevant tokens to eval
    const tokens: string[] = [];

    // Take the next token unconditionally.
    let take = false;

    // Collect the tokens we care about from the AST
    visit(source);

    // For each token, transform them into `Node`s.
    tokens.forEach((token, i) => {
        if (token === 'command') {
            config.command = command(tokens[i + 1]);
        } else if (token === 'args') {
            config.args = args(tokens[i + 1]);
        } else if (token === 'env') {
            config.env = env(tokens[i + 1]);
        }
    });

    return config;

    // Visit a Typescript AST node and track relevant ones.
    //
    // We only care about two types of nodes – `Identifier` (that has a text
    // value of "command", "args", or "env") and next node.
    //
    function visit(node: ts.Node) {
        // Previous token was an identifier that we care about. If that's the
        // case, also track this node as it's the value of one of those objects
        if (take) {
            tokens.push(node.getText());
        }

        // Reset this so we only record N(Identifier)+1 nodes.
        take = false;

        // If we care about this, track it.
        if (node.kind == ts.SyntaxKind.Identifier && isNeeded(node.getText())) {
            tokens.push(node.getText());
            take = true;
        }

        // Keep on truck'n.
        ts.forEachChild(node, (c) => visit(c));
    }

    // Command is always just a plain string.
    //
    function command(text: string) {
        return new StringNode(text);
    }

    // Parse the list of `args` into a list of `Node`s.
    //
    // An `arg` can either just be a plain string – "--verbose" – which will end
    // up as a `StringNode`.
    //
    // Or it can be a `config` variable – "config.apiKey" – which will end up
    // as a `ConfigNode` and be evaluated later for the final value.
    //
    function args(text: string): Node[] {
        text = text.replace('[', '').replace(']', '');

        if (text == '') {
            return [];
        }

        return text
            .split(',')
            .map(a => (
                IS_CONFIG.test(a)
                    ? new ConfigNode(a.trim().replace('config.', ''))
                    : new StringNode(a)
            ))
            .compact() as Node[];
    }

    // Parse the list of `env` vars into a list of `Node`s.
    //
    // `env` entries will always have a plain string key, but can have a string 
    // or config value.
    //
    // Does the same as `args` and tracks the corresponding `Node` to be
    // evaluated later.
    //
    function env(text: string): Record<string, Node> {
        text = text.replace('{', '').replace('}', '');

        if (text === '') {
            return {};
        }

        return Object.fromEntries(
            text
                .split(',')
                .map(kv => {
                    let [k, v] = kv.split(':'); // eslint-disable-line
                    let value: Node = new StringNode(v);

                    if (IS_CONFIG.test(v)) {
                        value = new ConfigNode(v.replace('config.', ''));
                    }

                    return [k, value];
                })
        );
    }

    // We only care about these three keys
    //
    function isNeeded(text: string) {
        return ['command', 'args', 'env'].includes(text);
    }
}
