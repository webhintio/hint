import { IAsyncHTMLElement } from 'hint/dist/src/lib/types';

export const mockStyleElement = (type: string, code: string) => ({
    getAttribute() {
        return type;
    },
    outerHTML() {
        return Promise.resolve(`<style>  ${code}  </style>`);
    }
} as Partial<IAsyncHTMLElement>);
