import { info } from '$lib/logger';

export enum StartupCheck {
    Ollama = 'ollama',
    Agreement = 'agreement',
    MissingModels = 'missing-models',
    UpdateAvailable = 'update-available',
}

export type Condition = () => Promise<boolean>;
export type OnSuccess = () => Promise<void>;

const checks: Array<[StartupCheck, Condition, OnSuccess?]> = [];

export default {
    // Adds a check, if necessary, to continually attempt until success.
    //
    // Needs to run the `condition` and (optional) `onSuccess` once, immediately,
    // in case this is being triggered by an HMR in dev.
    //
    // During HMR, we reload into whatever the current URL is, meaning we don't
    // visit the root route where these checks are normally executed. We need
    // them to run here, so that the `onSuccess` functions execute and do
    // things like sync the database, load models, etc.
    //
    async addCheck(check: StartupCheck, condition: Condition, onSuccess?: OnSuccess) {
        // Immediately run the check to see if it's already satisfied.
        if (!(await condition())) {
            info(`[red]ⅹ startup check failed:[default] ${check}`);
            checks.push([check, condition, onSuccess]);
        } else {
            info(`[green]✔ startup check passed:[default] ${check}`);
            await onSuccess?.();
        }
    },

    get checks() {
        return checks;
    },
};
