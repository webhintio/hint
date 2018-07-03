import { debug as d } from './debug';

const debug: debug.IDebugger = d(__filename);

export const asyncTry = <T>(asyncFn: (...args: any[]) => Promise<T>) => {
    return async (...args: any[]): Promise<T> => {
        try {
            return await asyncFn(...args);
        } catch (err) {
            debug(err);

            return null;
        }
    };
};
