/** Convenience wrapper to add a delay using promises. */
export default (millisecs: number): Promise<object> => new Promise((resolve) => {
    setTimeout(resolve, millisecs);
});
