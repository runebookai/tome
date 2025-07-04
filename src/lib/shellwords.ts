export * from 'shellwords';

export function join(args: string[]): string {
    return args.map(arg => (arg.includes(' ') ? `"${arg}"` : arg)).join(' ');
}
