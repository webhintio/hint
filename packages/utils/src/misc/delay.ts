/** Convenience wrapper to add a delay using promises. */
export const delay = (millisecs: number): Promise<object> => {
    return new Promise((resolve) => {
        setTimeout(resolve, millisecs);
    });
};
