export interface Option {
    icon?: string;
    label: string;
    value: string;
}

export interface OptionGroup {
    icon?: string;
    label?: string;
    options: Option[];
}
