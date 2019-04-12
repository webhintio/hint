import { HTMLElement } from '@hint/utils/dist/src/dom/html';

export const mockStyleElement = (type: string, code: string) => {
    return {
        getAttribute() {
            return type;
        },
        innerHTML: code
    } as Partial<HTMLElement> as HTMLElement;
};
