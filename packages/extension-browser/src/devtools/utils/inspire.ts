import { useEffect, useState } from 'react';

import { getMessage, MessageName } from './i18n';

const messages: [MessageName, number[]][] = [
    ['statWebsitesUsingLibrariesWithKnownVulnerabilities', [78.6]],
    ['statAverageLoadTimeForMobileSites', [19]],
    ['statMobileSiteVisitsAbandonedByLoad', [53, 3]],
    ['statWebsitesPerformARedirect', [84]],
    ['statSitesForgetToCompressResources', [97.5]],
    ['statSitesCompressResourcesTheyShouldNot', [72.8]],
    ['statResourcesAreNotCacheable', [52]],
    ['statMedianSiteSize', [1731]],
    ['statJavaScriptTakesMoreToProcessThanJPEG', []]
];

let remaining = [...messages];

export const inspire = (): string => {
    if (!remaining.length) {
        remaining = [...messages];
    }

    const index = Math.floor(Math.random() * remaining.length);
    const message = remaining.splice(index, 1)[0];

    return getMessage(message[0], message[1].map((n) => {
        return n.toLocaleString();
    }));
};

/** Generate a status message that periodically changes. */
export const useRotatingInspiration = () => {
    const [message, setMessage] = useState(inspire);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessage(inspire());
        }, 7500);

        return () => {
            clearInterval(interval);
        };
    });

    return message;
};
