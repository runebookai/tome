/* eslint-disable */
import moment from "moment";

export enum Level {
    LOG = 'LOG',
    INFO = 'INFO',
    DEBUG = 'DEBUG',
    ERROR = 'ERROR',
}

const colors = {
    grey: '#999999',
    blue: '#a9b1d6',
    yellow: '#ffc777',
    green: '#c3e88d',
    red: '#ff757f',
    purple: '#bb9af7',
    white: '#ffffff',
    default: '#ffffff',
};

const levelColors = {
    [Level.LOG]: 'grey',
    [Level.INFO]: 'blue',
    [Level.DEBUG]: 'yellow',
    [Level.ERROR]: 'red',
};

export function log(text: string, ...rest: any[]) {
    console.log(...fmt(Level.LOG, text), ...rest);
};

export function info(text: string, ...rest: any[]) {
    console.info(...fmt(Level.INFO, text), ...rest);
};

export function debug(text: string, ...rest: any[]) {
    console.debug(...fmt(Level.DEBUG, text), ...rest);
};

export function error(text: string, ...rest: any[]) {
    console.error(...fmt(Level.ERROR, text), ...rest);
};

function fmt(level: Level, text: string): string[] {
    const now = moment();
    const date = now.format('YYYY-MM-DD');
    const time = now.format('hh:mm:ss');
    const lvl = levelColors[level];

    return colorize(`[grey]${date}\t${time}\t\ttome\t[${lvl}]${level}\t\t[white]${text}`);
}

function colorize(text: string): string[] {
    let args: string[] = [];

    text = text.replace(/\[\w+\]/g, (block) => {
        const code = block.replace('[', '').replace(']', '');
        const color = (colors as Obj)[code];
        args.push(`color: ${color};`);
        return '%c';
    });

    return [text, ...args];
}
