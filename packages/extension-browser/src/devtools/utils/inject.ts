import { browser } from '../../shared/globals';

export const evaluate = (code: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        browser.devtools.inspectedWindow.eval(code, (result, err) => {
            if (err) {
                reject(err);

                return;
            }

            resolve(result);
        });
    });
};
