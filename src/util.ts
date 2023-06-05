import * as vscode from "vscode";
import axios from "axios";

const apiPort = vscode.workspace.getConfiguration("obakeCode").get("apiPort");

const API_BASE = `http://localhost:${apiPort}/`;

export interface Workspace {
  cwd: string;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "BACKGROUND";
  color: string;
  id: string;
  codeWorkspacePath: string;
}

export async function fetchWorkspaces(): Promise<Workspace[]> {
  const res = await axios.get(`${API_BASE}workspaces`);
  return await res.data.workspaces;
}

export async function fetchActiveWorkspace(): Promise<Workspace | undefined> {
  const workspaces = await fetchWorkspaces();
  return workspaces.find((workspace) => workspace.status === "ACTIVE");
}

export async function switchWorkspaceWindow(
  workspaceId: string
): Promise<void> {
  await axios.post(`${API_BASE}workspaces/switch`, {
    workspaceId,
  });
}
