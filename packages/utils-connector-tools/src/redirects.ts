/**
 * @fileoverview This helper makes it easier to calculate the `hops` of a request
 */

export class RedirectManager {
    private _redirects: Map<string, string> = new Map();

    /** Adds a new `hop` to the list */
    public add(destination: string, source: string) {
        this._redirects.set(destination, source);
    }

    /**
     * Calculates the number of `hop`s for a given target.
     *
     *  Known issues: it doesn't support multiple redirects to the same url. This shouldn't happen very
     * often in the same page
     */
    public calculate(target: string): Array<string> {
        /*
         * To find the number of `hops` we look into the `redirects` `Map` which should look similar to:
         *
         * | key  | value |
         * |------|-------|
         * | url2 | url1  |
         * | url3 | url2  |
         * | url4 | url3  |
         *
         * `targetUrl` is initially `url4` (the url for what we got the response for). We make our way
         * up until `url1`. When we check if `url1` has any redirect, we don't find anything so we
         * know we've reached the original `resourceUrl` and we can stop looking.
         * Because `hops` always contains the latest url, we `pop` to have the intermediate requests.
         */
        let targetUrl: string = target;
        const hops: Array<string> = [targetUrl];

        while (this._redirects.has(targetUrl)) {
            targetUrl = this._redirects.get(targetUrl)!; // The `has` check above means this exists.

            /*
             * In some edgy cases the redirect ends in the
             * same URL that it starts.
             *
             * http://url1 => http://url2
             * http://url2 => http://url3
             * http://url3 => http://url1
             *
             * In these cases, the hop returned should contain
             * the first URL too:
             *
             * ['http://url1', 'http://url2', 'http://url3']
             */

            const finish = hops.includes(targetUrl);

            hops.unshift(targetUrl);

            if (finish) {
                break;
            }
        }
        hops.pop();

        return hops;
    }
}
