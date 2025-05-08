import { OllamaClient, type OllamaModel } from "$lib/llm";

export type IModel = OllamaModel;

export interface Details {
    parentModel: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
}

let repo: IModel[] = $state([]);

export default class Model {
    static async sync(): Promise<void> {
        const client = new OllamaClient();
        const models: IModel[] = await client.list();

        repo = await Promise.all(
            models.map(async m => {
                const model = await client.info(m.name);
                return { ...m, ...model }
            })
        );
    }

    static default(): IModel {
        return repo[0];
    }

    static find(name: string): IModel {
        return repo.find(m => m.name == name) as IModel;
    }

    static exists(name: string): boolean {
        return this.find(name) !== undefined;
    }

    static first(): IModel {
        return repo[0];
    }

    static last(): IModel {
        return repo[repo.length - 1];
    }

    static all(): IModel[] {
        return repo;
    }

    static supportsTools(model: IModel): boolean {
        return model && model.capabilities?.includes('tools') == true;
    }
}
