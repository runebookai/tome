// Callable implemented by Closable components
type Closable = (() => Promise<void>) | (() => void);

// List of callables to invoke
let closables: Array<[Node, Closable]> = [];

// Manage a list of functions that should be called when the window is clicked.
//
// Used in custom dropdowns/menus to close when the User clicks outside of the
// element.
//
// Triggered by `routes/+layout.svelte`
// 
export default {
    register(ele: Node, fn: Closable) {
        closables.push([ele, fn]);
    },

    unregister(ele: Node) {
        closables = closables.filter(([e, _]) => ele !== e);
    },

    closeAll() {
        closables.forEach(([_, fn]) => {
            fn();
        });
    },

    close(e: Event) {
        closables.forEach(([ele, fn]) => {
            if (!ele.contains?.(e.target as Node)) {
                fn();
            }
        });
    }
};
