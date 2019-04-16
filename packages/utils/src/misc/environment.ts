/* eslint-disable no-process-env */
export const getVariable = (name: string) => {
    return process.env[name];
};

export const setVariable = (name: string, value: string) => {
    process.env[name] = value;
};
