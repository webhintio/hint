/**
 * @fileoverview Helper to cache features, if we have tested a concrete feature in concrete scenario we are no going to check again.
 */

import { FeatureInfo } from '../types';

export class CompatFeaturesCache {
    private cachedFeatures = new Set<string>();

    public add(feature: FeatureInfo): void {
        const key = this.getFeatureKey(feature);

        this.cachedFeatures.add(key);
    }

    public has(feature: FeatureInfo): boolean {
        const key = this.getFeatureKey(feature);

        return this.cachedFeatures.has(key);
    }

    private getFeatureKey(feature: FeatureInfo) {
        const { name, prefix } = feature;

        const featureName = prefix ?
            prefix + name :
            name;

        const location = feature.location ?
            feature.location.column.toString() +
                feature.location.line.toString() : '';

        return featureName + location;
    }
}
