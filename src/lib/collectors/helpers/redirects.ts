/**
 * @fileoverview This helper makes it easier to calculate the `hops` of a request
 */

export const redirectManager = () => {
    const redirects: Map<string, string> = new Map();

    return {
        /** Adds a new `hop` to the list */
        add(destination: string, source: string) {
            redirects.set(destination, source);
        },
        /** Calculates the number of `hop`s for a given target.
         *
         *  Known issues: it doesn't support multiple redirects to the same url. This shouldn't happen very
         * often in the same page
        */
        calculate(target) {
            /*
                To find the number of `hops` we look into the `redirects` `Map` which should look similar to:

                | key  | value |
                |------|-------|
                | url2 | url1  |
                | url3 | url2  |
                | url4 | url3  |

                `targetUrl` is initially `url4` (the url for what we got the response for). We make our way
                up until `url1`. When we check if `url1` has any redirect, we don't find anything so we
                know we've reached the original `resourceUrl` and we can stop looking.
                Because `hops` always contains the latest url, we `pop` to have the intermediate requests.
            */
            let targetUrl = target;
            const hops = [targetUrl];

            while (redirects.has(targetUrl)) {
                targetUrl = redirects.get(targetUrl);
                hops.unshift(targetUrl);
            }
            hops.pop();

            return hops;
        }
    };
};
