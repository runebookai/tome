export type ColorScheme = 'system' | 'light' | 'dark';

export function apply(scheme: ColorScheme = 'system') {
    if (scheme == 'system') {
        scheme = systemScheme();
    }

    document.documentElement.setAttribute('data-theme', scheme);
}

function systemScheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
