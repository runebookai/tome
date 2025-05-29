import hljs from 'highlight.js';
import { marked } from 'marked';

export default {
    render(content: string): string {
        marked.use({
            renderer: {
                link({ href, text }): string {
                    return `<a href="${href}" target="_blank">${text}</a>`;
                },

                code({ text, lang = 'plaintext' }) {
                    lang = hljs.getLanguage(lang) ? lang : 'plaintext';
                    const code = hljs.highlight(text, { language: lang }).value;
                    return `<pre><code>${code}</code></pre>`;
                },
            },
        });

        return marked.parse(content, { async: false });
    },
};
