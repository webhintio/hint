/** Lower cases all the items of `list`. */
export const toLowerCaseArray = (list: string[]): string[] => {
    return list.map((e) => {
        return e.toLowerCase();
    });
};
