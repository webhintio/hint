import { HTMLElement } from '@hint/utils-dom/dist/src/htmlelement';

export const mockStyleElement = (type: string, code: string) => {
    return {
        getAttribute() {
            return type;
        },
        innerHTML: code
    } as Partial<HTMLElement> as HTMLElement;
};
