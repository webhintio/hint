import * as React from 'react';

import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import http from 'react-syntax-highlighter/dist/esm/languages/prism/http';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import xml from 'react-syntax-highlighter/dist/esm/languages/prism/markup';

import * as styles from './source-code.css';

// Explictly register languages so only those needed get bundled.
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('http', http);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('xml', xml);

type Props = {
    children: any;
    language?: string;
};

const SourceCode = ({ children, language }: Props) => {
    const lang = language || 'html';

    return (
        <SyntaxHighlighter className={styles.root} useInlineStyles="false" language={lang} codeTagProps={{ class: lang }}>
            {children}
        </SyntaxHighlighter>
    );
};

export default SourceCode;
