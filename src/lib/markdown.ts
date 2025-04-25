import { marked } from "marked";

export default {
    render(content: string): string {
        marked.use({
            renderer: {
                link({ href, text }): string {
                    return `<a href="${href}" target="_blank">${text}</a>`;
                }
            }
        });

        return marked.parse(content, { async: false });
    }
};
