import { Category } from '@hint/utils/dist/src/types/category';
import { HintScope } from '../enums/hint-scope';

export type MetadataDocs = {
    category?: Category;
    description: string;
    name?: string;
};

export type HintMetadata = {
    /** Documentation related to the hint */
    docs?: MetadataDocs;
    /** Returns the localized description */
    getDescription: (language: string) => string;
    /** Returns the localized name */
    getName: (language: string) => string;
    /** The id of the hint */
    id: string;
    /** List of connectors that should not run the hint */
    ignoredConnectors?: string[];
    /** The schema the hint configuration must follow in order to be valid */
    schema: any[]; // TODO: this shouldn't be an Array of any
    /** The scope of the hints (local, site, any) */
    scope: HintScope;
};
