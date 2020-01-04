import { getHintPath, testHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';
import { getTests } from './_generate-tests';

const tests = getTests(Severity.warning);

testHint(getHintPath(__filename), tests);
