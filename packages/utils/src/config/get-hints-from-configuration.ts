import normalizeHints from './normalize-hints';
import { loadResource } from '../packages/load-resource';
import { ResourceType } from '../types/resource-type';
import { UserConfig, HintsConfigObject } from '../types/config';

const getHintsFromExtend = (extendName: string, parentConfigs: string[] = []) => {
    try {
        if (parentConfigs.includes(extendName)) {
            return {};
        }

        const configuration = loadResource(extendName, ResourceType.configuration, parentConfigs);

        return {
            ...getHintsFromExtends(configuration.extends, [extendName, ...parentConfigs]), // eslint-disable-line no-use-before-define,@typescript-eslint/no-use-before-define
            ...normalizeHints(configuration.hints || {})
        };
    } catch (e) { // If the configuration doesn't exists, ignore it and returns an empty object.
        return {};
    }
};

const getHintsFromExtends = (extendNames?: string[], parentConfigs: string[] = []): any => {
    if (!extendNames || extendNames.length === 0) {
        return {};
    }

    const extendName = extendNames[0];

    return {
        ...getHintsFromExtend(extendName, parentConfigs),
        ...getHintsFromExtends(extendNames.slice(1), parentConfigs)
    };
};

/**
 * Returns a list of all the hints in a configuration, including
 * the ones inside the extends.
 */
export const getHintsFromConfiguration = (userConfig: UserConfig): HintsConfigObject => {
    return {
        ...getHintsFromExtends(userConfig.extends),
        ...normalizeHints(userConfig.hints || {})
    };
};
