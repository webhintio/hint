import { HTMLElement } from '@hint/utils-dom';

export const mockStyleElement = (lang: 'sass' | 'scss' | null, code: string) => {
    return {
        getAttribute(name: string) {
            return name === 'lang' ? lang : null;
        },
        innerHTML: code
    } as Partial<HTMLElement> as HTMLElement;
};
