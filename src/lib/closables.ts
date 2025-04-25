// Callable implemented by Closable components
type Closable = (() => Promise<void>) | (() => void);

// List of callables to invoke
// eslint-disable-next-line
const closables: Array<[any, Closable]> = [];

// Manage a list of functions that should be called when the window is clicked.
//
// Used in custom dropdowns/menus to close when the User clicks outside of the
// element.
//
// Triggered by `routes/+layout.svelte`
// 
export default {
    register(ele: any, fn: Closable) { // eslint-disable-line
        closables.push([ele, fn]);
    },

    close(e: Event) {
        closables.forEach(([ele, fn]) => {
            if (e.target !== ele) {
                fn();
            }
        });
    }
};
