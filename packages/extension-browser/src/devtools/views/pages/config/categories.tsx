import * as React from 'react';
import { useCallback, FormEvent } from 'react';

import { Category } from 'hint/dist/src/lib/enums/category';

import metas from '../../../../shared/metas.import';

import { getMessage } from '../../../utils/i18n';

import ConfigLabel from './config-label';
import ConfigSection from './config-section';

type Props = {
    disabled?: string[];
    onChange: (disabled?: string[]) => void;
};

// Extract category names from bundled hint metadata.
const categories = [...new Set(metas.map((meta) => {
    return (meta.docs && meta.docs.category || Category.other);
}))].sort();

/**
 * Display options to include/exclude entire categories of hints from a scan.
 */
const CategoriesSection = ({ disabled, onChange }: Props) => {

    /** Report disabled categories when a category is enabled/disabled. */
    const onCategoryChange = useCallback((event: FormEvent<HTMLInputElement>) => {
        const input = (event.target as HTMLInputElement);
        const category = input.value;
        const disabledCategories = new Set(disabled);

        if (input.checked) {
            disabledCategories.delete(category);
        } else {
            disabledCategories.add(category);
        }

        if (disabledCategories.size) {
            onChange([...disabledCategories]);
        } else {
            onChange();
        }
    }, [disabled, onChange]);

    const categoryInputs = categories.map((category) => {
        const isDisabled = disabled && disabled.includes(category);

        return (
            <ConfigLabel key={category}>
                <input type="checkbox" value={category} checked={!isDisabled} onChange={onCategoryChange} />
                {getMessage(category)}
            </ConfigLabel>
        );
    });

    return (
        <ConfigSection title={getMessage('categoriesTitle')}>
            {categoryInputs}
        </ConfigSection>
    );
};

export default CategoriesSection;
