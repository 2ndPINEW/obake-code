import * as vscode from "vscode";
import {
  fetchActiveWorkspace,
  fetchWorkspaces,
  switchWorkspaceWindow,
  Workspace,
} from "./util";

export function activate(context: vscode.ExtensionContext) {
  const disposables = [];

  disposables.push(
    vscode.commands.registerCommand("obakeCode.openWorkspace", () =>
      openWorkspaceSelectPrompt()
    )
  );

  context.subscriptions.push(...disposables);

  setInterval(() => {
    checkActiveWorkspace();
  }, 5000);

  checkActiveWorkspace();
}

export function deactivate() {}

async function openWorkspaceSelectPrompt() {
  const currentWorkspaceName = vscode.workspace.name;
  const workspaceEntries = (await fetchWorkspaces()).filter(
    (entry) => entry.name !== currentWorkspaceName
  );

  if (!workspaceEntries.length || workspaceEntries.length <= 0) {
    vscode.window.showInformationMessage("No workspaces found");
    return;
  }

  const workspaceItems = workspaceEntries.map(
    (entry) =>
      <vscode.QuickPickItem>{
        label: entry.name,
        description: entry.cwd,
      }
  );

  const options = <vscode.QuickPickOptions>{
    matchOnDescription: false,
    matchOnDetail: false,
    placeHolder: `Choose a workspace`,
  };

  vscode.window.showQuickPick(workspaceItems, options).then(
    (workspaceItem: vscode.QuickPickItem | undefined) => {
      if (!workspaceItem) {
        return;
      }

      const entry = workspaceEntries.find(
        (entry) => entry.cwd === workspaceItem.description
      );

      if (!entry) {
        return;
      }

      switchWorkspace(entry);
    },
    (reason: any) => {}
  );
}

async function checkActiveWorkspace() {
  const targetWorkspace = await fetchActiveWorkspace();
  const currentWorkspaceName = vscode.workspace.name;
  console.log("targetWorkspace", targetWorkspace);

  if (!targetWorkspace) {
    return;
  }
  if (targetWorkspace.name !== currentWorkspaceName) {
    openWorkspace(targetWorkspace.codeWorkspacePath);
  }
}

function openWorkspace(path: string) {
  const workspaceUri = vscode.Uri.file(path);
  vscode.commands.executeCommand("vscode.openFolder", workspaceUri, false).then(
    () => {},
    () => {}
  );
}

async function switchWorkspace(entry: Workspace) {
  await switchWorkspaceWindow(entry.id);
  await checkActiveWorkspace();
}
