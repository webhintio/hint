import { HTMLElement } from 'hint/dist/src/lib/types';

export const mockStyleElement = (type: string, code: string) => {
    return {
        getAttribute() {
            return type;
        },
        outerHTML() {
            return `<style>  ${code}  </style>`;
        }
    } as Partial<HTMLElement> as HTMLElement;
};
