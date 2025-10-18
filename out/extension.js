"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
// Track toggle state per document
const state = new WeakMap();
function activate(ctx) {
    ctx.subscriptions.push(vscode.commands.registerCommand("vueSplit.toggle", async () => {
        const active = vscode.window.activeTextEditor;
        if (!active || active.document.languageId !== "vue")
            return;
        const doc = active.document;
        const left = active;
        const isOn = state.get(doc) ?? false;
        if (isOn) {
            await collapse(doc);
            state.set(doc, false);
            return;
        }
        const scriptPos = findTag(doc, "<script");
        const templatePos = findTag(doc, "<template");
        const stylePos = findTag(doc, "<style");
        // 1. Focus LEFT and fold its template/style
        const leftEditor = await setFocusTo(left);
        await foldRanges(leftEditor, [templatePos, stylePos]);
        // 2. Open RIGHT editor and fold its script/style
        const right = await vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.Beside,
            preview: false,
        });
        await foldRanges(right, [scriptPos, stylePos]);
        if (templatePos) {
            right.revealRange(templatePos, vscode.TextEditorRevealType.InCenter);
        }
        // 3. Return focus to LEFT and reveal script
        await setFocusTo(left);
        if (scriptPos) {
            left.revealRange(scriptPos, vscode.TextEditorRevealType.InCenter);
        }
        state.set(doc, true);
    }));
}
async function collapse(doc) {
    const twin = vscode.window.visibleTextEditors.find((e) => e.document === doc && e !== vscode.window.activeTextEditor);
    if (twin) {
        await twin.hide();
    }
    await vscode.commands.executeCommand("editor.unfoldAll");
}
function findTag(doc, tag) {
    const text = doc.getText();
    const startIdx = text.indexOf(tag);
    if (startIdx === -1)
        return undefined;
    const start = doc.positionAt(startIdx);
    const tagEnd = startIdx + tag.length;
    // Find the corresponding closing tag
    const closingTag = `</${tag.slice(1)}`;
    const endIdx = text.indexOf(closingTag, tagEnd);
    if (endIdx === -1)
        return undefined;
    const end = doc.positionAt(endIdx + closingTag.length);
    return new vscode.Range(start, end);
}
async function foldRanges(displayedEditor, ranges) {
    if (!ranges)
        return;
    for (const range of ranges) {
        if (!range)
            continue;
        // Set selection to the range and fold it
        displayedEditor.selection = new vscode.Selection(range.start, range.end);
        await vscode.commands.executeCommand("editor.fold");
    }
}
const setFocusTo = async (editor) => await vscode.window.showTextDocument(editor.document, editor.viewColumn, false);
function deactivate() { }
//# sourceMappingURL=extension.js.map