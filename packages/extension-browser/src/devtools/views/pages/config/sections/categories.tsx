import * as React from 'react';
import { useCallback, FormEvent } from 'react';

import { Category } from 'hint/dist/src/lib/enums/category';

import metas from '../../../../../shared/metas.import';

import { getMessage } from '../../../../utils/i18n';

import Checkbox from '../../../controls/checkbox';
import LabelText from '../../../controls/label-text';

import ConfigLabel from '../label';
import ConfigSection from '../section';

import * as styles from './categories.css';

type Props = {
    className?: string;
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
const CategoriesSection = ({ className, disabled, onChange }: Props) => {

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
                <Checkbox value={category} checked={!isDisabled} onChange={onCategoryChange} />
                <LabelText className={styles.label} data-icon={category}>
                    {getMessage(category)}
                </LabelText>
            </ConfigLabel>
        );
    });

    return (
        <ConfigSection className={className} title={getMessage('categoriesTitle')}>
            {categoryInputs}
        </ConfigSection>
    );
};

export default CategoriesSection;
