import * as React from 'react';

import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/light';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';

import * as styles from './source-code.css';

// Explictly register languages so only those needed get bundled.
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('xml', xml);

type Props = {
    children: string;
};

const SourceCode = ({ children }: Props) => {
    return (
        <SyntaxHighlighter className={styles.root} useInlineStyles="false">
            {children}
        </SyntaxHighlighter>
    );
};

export default SourceCode;
