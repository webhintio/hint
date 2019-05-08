import { browser } from '../../shared/globals';

type EvalCallback = (result: any, err: chrome.devtools.inspectedWindow.EvaluationExceptionInfo) => void;

export const evaluate = (code: string, callback?: EvalCallback): void => {
    browser.devtools.inspectedWindow.eval(code, callback);
};
