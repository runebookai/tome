/**
 * Model class NOT backed by a database
 */
export default function BareModel<T extends Obj>() {
    let repo: T[] = $state([]);

    return class BareModel {
        static reset(instances: T[] = []) {
            repo = instances;
        }

        static add(instance: T) {
            repo.push(instance);
        }

        static delete(instance: T) {
            repo = repo.filter(i => i !== instance);
        }

        static all(): T[] {
            return repo;
        }

        static find(id: string): T | undefined {
            return repo.findBy('id', id);
        }

        static findBy(params: Partial<T>): T | undefined {
            return repo.find(r => Object.entries(params).every(([key, value]) => r[key] == value));
        }

        static first(): T {
            return repo[0];
        }

        static last(): T {
            return repo[repo.length - 1];
        }
    };
}
