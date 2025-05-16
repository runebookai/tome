import type { PageLoad } from "./$types";

import { Engine } from "$lib/models";

export const load: PageLoad = async (): Promise<void> => {
    await Engine.sync();
}
