import { HTMLElement } from '@hint/utils-dom/dist/src/htmlelement';

export const mockStyleElement = (type: string | null, code: string) => {
    return {
        getAttribute(name: string) {
            return name === 'type' ? type : null;
        },
        innerHTML: code
    } as Partial<HTMLElement> as HTMLElement;
};
