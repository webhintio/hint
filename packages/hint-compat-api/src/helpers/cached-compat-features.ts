/**
 * @fileoverview Helper to cache features, if we have tested a concrete feature in concrete scenario we are no going to check again.
 */

import { ProblemLocation } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';

type CachedFeature = {
    featureName: string;
    resource: string;
    message: string;
    location?: ProblemLocation;
};

type CachedFeatures = {
    [key: string]: CachedFeature[];
};

export class CachedCompatFeatures {
    private cachedFeatures: CachedFeatures = {};

    public add(featureName: string): void {
        this.cachedFeatures[featureName] = [];
    }

    public isCached(featureName: string): boolean {
        return !!this.cachedFeatures[featureName];
    }

    public addError(featureName: string, resource: string, message: string, location?: ProblemLocation) {
        this.cachedFeatures[featureName] = this.cachedFeatures[featureName] || [];

        this.cachedFeatures[featureName].push({
            featureName,
            location,
            message,
            resource
        });
    }

    public showCachedErrors(featureName: string, context: HintContext, location?: ProblemLocation): void {
        const cachedErrors = this.cachedFeatures[featureName];

        if (!cachedErrors || cachedErrors.length < 1) {
            return;
        }

        cachedErrors.forEach((cachedFeature: CachedFeature) => {
            context.report(cachedFeature.resource, null, cachedFeature.message, featureName, location || cachedFeature.location);
        });
    }
}
