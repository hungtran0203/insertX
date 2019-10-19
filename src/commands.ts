// The MIT License (MIT)
//
// Copyright (c) Heath Stewart
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import * as vscode from 'vscode';

import script from './generators/script';

class XPickItem implements vscode.QuickPickItem {
    private _index : number | string;
    private _generator : (selection? : any, textEditor?: any) => string;

    constructor(index : any, generator: any) {
        this._index = index;
        this._generator = generator;
    }

    get label() : string {
        return this._index.toString();
    }

    get description() : any {
        return this._index;
    }

    get text() : string {
        return this._generator('vscode.Selection');
    }

    generate(selection?: any, textEditor?: any) {
        return this._generator(selection, textEditor);
    }
}

/**
 * Extension commands for working with GUIDs.
 */
export class XCommands {

    /**
     * Inserts GUID at the cursor position(s) or replaces active selection(s).
     * @param textEditor {vscode.TextEditor} The active text editor.
     * @param edit {vscode.TextEditorEdit} A text edit builder for the intended change.
     */
    static insertCommand(textEditor : vscode.TextEditor, edit : vscode.TextEditorEdit) {
        XCommands.insertCommandImpl(textEditor, edit);
    }

    /**
     * Inserts unique GUIDs at each cursor position or replaces active selection(s).
     * @param textEditor {vscode.TextEditor} The active text editor.
     * @param edit {vscode.TextEditorEdit} A text edit builder for the intended change.
     */
    static insertManyCommand(textEditor : vscode.TextEditor, edit : vscode.TextEditorEdit) {
        XCommands.insertCommandImpl(textEditor, edit);
    }

    static async insertCommandImpl(textEditor : vscode.TextEditor, edit : vscode.TextEditorEdit) {
        const items = await XCommands.listQuickPickItems(textEditor);
        vscode.window.showQuickPick<XPickItem>(items)
            .then(item => {
                if (typeof item === 'undefined') {
                    return;
                }
                textEditor.selections.map(async (selection) => {
                    const output = await item.generate(selection, textEditor);
                    textEditor.edit(edit => {
                        if (selection.isEmpty) {
                            edit.insert(selection.start, output );
                        } else {
                            edit.replace(selection, output);
                        }    
                    });
                })
            });
    }

    static async listQuickPickItems(textEditor: vscode.TextEditor) : Promise<XPickItem[]> {
        const generators: any[] = [
            script,
        ];
        const items : XPickItem[] = [];
        await Promise.all(generators.map(async (generator) => {
            const objectItems = await generator(textEditor);
            for (let [itemName, gen] of Object.entries(objectItems)) {
                items.push(new XPickItem(itemName, gen))
            }    
        }))
        return items;
    }    
}
