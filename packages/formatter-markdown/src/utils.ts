import { Problem } from '@hint/utils-types';
import { Severity } from '@hint/utils-types';

export enum HeaderCount {
    Title = 1,
    Category = 2,
    Hint = 3,
    Message = 4
}

/**
 * Markdown Helpers.
 */
export class MarkdownHelpers {

    /**
     * Gets the severity unicode icon..
     * @param severity The severity level.
     */
    public static getSeverityIcon(severity: Severity): string {
        switch (severity) {
            case Severity.error:
                // No Entry - ⛔
                return '\u26D4';
            case Severity.warning:
                // Warning - ⚠
                return '\u26A0';
            case Severity.hint:
                // Lightbulb - 💡
                return '\u1F4A1';
            case Severity.information:
                // Information - ℹ
                return '\u2139';
            default:
                return '';
        }
    }

    /**
     * Gets the amount of problems depending on the severity.
     * @param problems The list of problems.
     * @param severity The severity to search for.
     */
    public static getHintLevelSummary(problems: Problem[]) {
        const severities = [
            Severity.error,
            Severity.warning,
            Severity.hint,
            Severity.information
        ];

        const list = severities.map((severity) => {
            const hintCount = this.getAmountOfHintsBySeverity(problems, severity);

            if (hintCount > 0) {
                return `* ${Severity[severity]}: ${hintCount}`;
            }

            return null;
        });

        return list.filter((s) => {
            return s !== null;
        }).join(this.newLine);
    }

    /**
     * Gets the amount of problems depending on the severity.
     * @param problems The list of problems.
     * @param severity The severity to search for.
     */
    private static getAmountOfHintsBySeverity(problems: Problem[], severity: Severity) {
        return problems.filter((problem) => {
            return problem.severity === severity;
        }).length;
    }

    /**
     * Creates the markdown headers of any size.
     * @param header The header text.
     * @param level The header level e.g. h3 / ###.
     */
    public static createHeader(header: string, level: number): string {
        // Add 1 to account for added whitespace between # and text.
        const sizeofStringAfter = header.length + 1 + level;

        return level > 0 ? ` ${header}`.padStart(sizeofStringAfter, '#') : header;
    }

    /**
     * Creates Link or images.
     * @param text The text or alt text.
     * @param link The link or image link.
     * @param displayImage A value indicating whether the link should be treated as an image.
     */
    public static createLink(text: string, link: string, displayImage: boolean = false): string {
        return `${displayImage ? '!' : ''}[${text}](${link})`;
    }

    /**
     * Creates the code snippets.
     * @param code The code to display.
     * @param language The language of the code. Defaults to HTML as the language since webhint doesnt specify a language if html.
     */
    public static createCodeSnippet(code: string, language: string | null | undefined): string {
        const codeSnippet =
            `
\`\`\` ${language ? language : 'html'}
${code}
\`\`\`
`;

        return codeSnippet;
    }

    /**
     * Markdown Horizontal rule.
     */
    public static horizontalRule = '---';

    /**
     * The New line/Carriage return.
     */
    public static newLine =
        `

`;
}
