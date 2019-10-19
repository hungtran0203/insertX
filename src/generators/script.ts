import * as vscode from 'vscode';
import loader from './loader';

const path = require('path');

export default async (textEditor?: any) => {
  const modules = {};
  // load all avaialble folder
  // .vscode under home folder
  const allPaths = [
    path.join(require('os').homedir(), '.vscode', '.insertX'),
  ];
  const wsFolder = vscode.workspace.getWorkspaceFolder(textEditor.document.uri);
  if(wsFolder) {
      const wsFolderUri = wsFolder.uri;
      allPaths.push(path.join(wsFolderUri.path, '.vscode', '.insertX'));
  }

  allPaths.map(scriptFolder => {
    Object.assign(modules, loader(scriptFolder))
  });

  return modules;
};
