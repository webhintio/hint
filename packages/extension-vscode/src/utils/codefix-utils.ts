import { CodeFix } from "@hint/utils-types";
import { TextDocument, TextEdit } from "vscode";
import { WorkspaceChange, Range } from "vscode-languageclient";

export function applyCodeFix(uri: TextDocument, fix: CodeFix) {
    const textEdit = TextEdit.replace(Range.create(fix.location.line, fix.location.endLine);
    const workspaceChange = new WorkspaceChange();
    workspaceChange.getTextEditChange({uri}).add(textEdit);
}
