/* eslint-disable */
import moment from 'moment';

export enum Level {
    LOG = 'log',
    INFO = 'info',
    DEBUG = 'debug',
    WARN = 'warn',
    ERROR = 'error',
}

const colors = {
    grey: '#999999',
    blue: '#a9b1d6',
    yellow: '#ffc777',
    green: '#c3e88d',
    orange: '#ff9e64',
    red: '#ff757f',
    purple: '#bb9af7',
    white: '#ffffff',
    default: '#ffffff',
};

const levelColors = {
    [Level.LOG]: 'grey',
    [Level.INFO]: 'blue',
    [Level.DEBUG]: 'yellow',
    [Level.WARN]: 'orange',
    [Level.ERROR]: 'red',
};

export function log(...args: any[]) {
    _log(args, Level.LOG);
}

export function info(...args: any[]) {
    _log(args, Level.INFO);
}

export function debug(...args: any[]) {
    _log(args, Level.DEBUG);
}

export function warn(...args: any[]) {
    _log(args, Level.WARN);
}

export function error(...args: any[]) {
    _log(args, Level.ERROR);
}

function _log(args: any[], level: Level) {
    if (typeof args[0] !== 'string') {
        console[level](...fmt(level, ''), ...args);
    } else {
        console[level](...args.flatMap(arg => (typeof arg === 'string' ? fmt(level, arg) : arg)));
    }
}

function fmt(level: Level, text: string): string[] {
    const now = moment();
    const date = now.format('YYYY-MM-DD');
    const time = now.format('hh:mm:ss');
    const lvl = levelColors[level];
    return colorize(
        `[grey]${date}\t${time}\t\ttome\t[${lvl}]${level.toUpperCase()}\t\t[white]${text}`
    );
}

function colorize(text: string): string[] {
    let args: string[] = [];

    text = text.replace(/\[\w+\]/g, block => {
        const code = block.replace('[', '').replace(']', '');
        const color = (colors as Obj)[code];
        args.push(`color: ${color};`);
        return '%c';
    });

    return [text, ...args];
}
