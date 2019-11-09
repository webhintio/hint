import { HTMLElement } from '@hint/utils-dom';

export const mockStyleElement = (type: string, code: string) => {
    return {
        getAttribute() {
            return type;
        },
        innerHTML: code
    } as Partial<HTMLElement> as HTMLElement;
};
