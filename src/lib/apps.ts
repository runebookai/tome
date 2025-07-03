import moment from 'moment';

import { App } from '$lib/models';

interface ScheduledEvent {
    type: 'scheduled';
    action: 'tick';
    data: {
        timestamp: moment.Moment;
    };
}

interface FilesystemEvent {
    type: 'filesystem';
    action: 'new_file' | 'file_updated';
    data: {
        path: string;
        contents: string;
    };
}

interface TelegramEvent {
    type: 'telegram';
    action: 'message';
    data: string;
}

type Event = ScheduledEvent | FilesystemEvent | TelegramEvent;

export async function trigger(event: Event) {
    const input = inputPromptFrom(event);
}

function inputPromptFrom(event: Event): null | string {
    if (event.type == 'scheduled') {
        return null;
    }

    if (event.type == 'filesystem') {
        if (event.action == 'new_file') {
            return `A new file was added at ${event.data.path} with the contents:\n\n\`\`\`${event.data.contents}\n\`\`\``;
        } else if (event.action == 'file_updated') {
            return `${event.data.path} was updated with the contents:\n\n\`\`\`${event.data.contents}\n\`\`\``;
        }
    }

    if (event.type == 'telegram') {
        return event.data;
    }

    return null;
}

export async function invoke(app: App, input: string) {}
