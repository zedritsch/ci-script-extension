// @ts-check

import { LanguageClient, TransportKind, ProtocolRequestType0 } from "vscode-languageclient/node.js";

/** @type {typeof import("vscode")} */
const vscode = (await import("node:module")).default.createRequire(import.meta.url)("vscode");

/**
 * @typedef {import("vscode").WorkspaceConfiguration} WorkspaceConfiguration
 * @typedef {import("vscode").QuickPickItem} QuickPickItem
 */

/**
 * @template {QuickPickItem} T
 * @typedef {import("vscode").QuickPick<T>} QuickPick
 */

/** @enum {string} */
const Translation = {
	/** @readonly */
	PROMPT: vscode.l10n.bundle?.prompt ?? "Set the path to your CI-Script installation",
	
	/** @readonly */
	SELECT: vscode.l10n.bundle?.select ?? "Select",
	
	/** @readonly */
	FILE: vscode.l10n.bundle?.file ?? "Set entered path",
	
	/** @readonly */
	FOLDER: vscode.l10n.bundle?.folder ?? "Select in file explorer",
	
	/** @readonly */
	DEFAULT: vscode.l10n.bundle?.default ?? "Default"
};

/** @type {QuickPickItem[]} */
const quick_pick_items = [
	{
		iconPath: vscode.ThemeIcon.File,
		label: Translation.FILE,
		alwaysShow: true
	},
	{
		iconPath: vscode.ThemeIcon.Folder,
		label: Translation.FOLDER
	},
	{
		kind: vscode.QuickPickItemKind.Separator,
		label: Translation.DEFAULT
	},
	{
		label: "cis"
	}
];

const selector = {
	scheme: "file",
	language: "ci-script"
};

/** @type {WorkspaceConfiguration} */
let configuration;

/** @type {LanguageClient} */
let client;

export async function activate() {
	configuration = vscode.workspace.getConfiguration("CI-Script");

	/** @type {string} */
	const location = configuration.get("location") ?? "";

	if (!location) {
		if (!await vscode.window.showInformationMessage(Translation.PROMPT, Translation.SELECT)) {
			return;
		}

		const quick_pick = vscode.window.createQuickPick();

		quick_pick.ignoreFocusOut = true;
		quick_pick.placeholder = Translation.PROMPT;
		quick_pick.value = location == "cis" ? "" : location;
		quick_pick.items = quick_pick_items;

		quick_pick.onDidHide(onQuickPickHide, quick_pick);
		quick_pick.onDidAccept(() => quick_pick.hide());
		quick_pick.show();

		return;
	}

	client = new LanguageClient(
		"CI-Script",
		{
			module: configuration.get("location") ?? "",
			transport: TransportKind.ipc
		},
		{
			documentSelector: [selector],
			synchronize: {
				fileEvents: vscode.workspace.createFileSystemWatcher("**/*.cis")
			}
		}
	);
	
	await client.start();
}

/** @this QuickPick<QuickPickItem> */
async function onQuickPickHide() {
	if (!this.selectedItems.length) {
		activate();

		this.dispose();

		return;
	}

	if (this.selectedItems[0].label == Translation.FOLDER) {
		this.value = (await vscode.window.showOpenDialog({
			title: Translation.PROMPT,
			openLabel: Translation.SELECT
		}))?.[0].fsPath ?? "";

		if (!this.value) {
			this.items = quick_pick_items;
	
			this.show();
	
			return;
		}
	}

	await configuration.update("location", this.value ? this.value : undefined, true);

	activate();

	this.dispose();
}

export async function deactivate() {
	return client ? await client.stop() : undefined;
}