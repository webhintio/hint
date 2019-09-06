import { HTMLElement } from '@hint/utils/dist/src/dom/html';

export const mockStyleElement = (type: string | null, code: string) => {
    return {
        getAttribute(name: string) {
            return name === 'type' ? type : null;
        },
        innerHTML: code
    } as Partial<HTMLElement> as HTMLElement;
};
