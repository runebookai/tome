import type { PageLoad } from "./$types";

import Model from "$lib/models/model.svelte";

export const load: PageLoad = async (): Promise<void> => {
    await Model.sync();
}
