/**
 * Model class NOT backed by a database
 */
export default function BareModel() {
    class BareModel {
        constructor(params: Partial<object>, privateInvocation = false) {
            if (!privateInvocation) {
                throw 'InvocationError: must instantiate models using `.new()`';
            }
            Object.assign(this, params);
        }

        static count<T extends typeof BareModel>(this: T) {
            return repo.length;
        }

        static new<T extends typeof BareModel>(this: T, params: Partial<InstanceType<T>> = {}) {
            const inst = new this({}, true);
            Object.assign(inst, params);
            return inst as InstanceType<T>;
        }

        static reset<T extends typeof BareModel>(this: T, instances: InstanceType<T>[] = []) {
            repo = instances;
        }

        static add<T extends typeof BareModel>(this: T, instance: InstanceType<T>) {
            repo.push(instance);
        }

        static all<T extends typeof BareModel>(this: T): InstanceType<T>[] {
            return repo as InstanceType<T>[];
        }

        static exists<T extends typeof BareModel>(
            this: T,
            params: Partial<InstanceType<T>>
        ): boolean {
            return this.findBy(params) !== undefined;
        }

        static find<T extends typeof BareModel>(this: T, id: string): InstanceType<T> | undefined {
            return repo.findBy('id', id) as InstanceType<T>;
        }

        static where<T extends typeof BareModel>(
            this: T,
            params: Partial<InstanceType<T>>
        ): InstanceType<T>[] {
            return repo.filter(m =>
                Object.entries(params).every(([k, v]) => (m as Obj)[k] == v)
            ) as InstanceType<T>[];
        }

        static findBy<T extends typeof BareModel>(
            this: T,
            params: Partial<InstanceType<T>>
        ): InstanceType<T> | undefined {
            return this.where(params)[0];
        }

        static findByOrDefault<T extends typeof BareModel>(
            this: T,
            params: Partial<InstanceType<T>>
        ): InstanceType<T> {
            return this.findBy(params) || this.new();
        }

        static first<T extends typeof BareModel>(this: T): InstanceType<T> {
            return repo[0] as InstanceType<T>;
        }

        static last<T extends typeof BareModel>(this: T): InstanceType<T> {
            return repo[repo.length - 1] as InstanceType<T>;
        }

        delete() {
            repo = repo.filter(i => i !== this);
        }
    }

    let repo: InstanceType<typeof BareModel>[] = $state([]);

    return BareModel;
}
