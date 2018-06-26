/** Convenience wrapper to add a delay using promises. */
export default (millisecs: number): Promise<object> => {
    return new Promise((resolve) => {
        setTimeout(resolve, millisecs);
    });
};
