// @ts-check

import { LanguageClient, TransportKind } from "vscode-languageclient/node.js";

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
	MESSAGE: vscode.l10n.bundle?.message ?? "Failed to start the language server",

	/** @readonly */
	ACTION: vscode.l10n.bundle?.action ?? "Enter a new path",

	/** @readonly */
	PLACEHOLDER: vscode.l10n.bundle?.placeholder ?? "Enter a file path or a command",
	
	/** @readonly */
	FILE: vscode.l10n.bundle?.file ?? "Set entered path",
	
	/** @readonly */
	FOLDER: vscode.l10n.bundle?.folder ?? "Select in file explorer",

	/** @readonly */
	TITLE: vscode.l10n.bundle?.title ?? "Set the path to your CI-Script installation",
	
	/** @readonly */
	SELECT: vscode.l10n.bundle?.select ?? "Select",
	
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

/** @type {WorkspaceConfiguration} */
let configuration;

/** @type {LanguageClient} */
let client;

export async function activate() {
	configuration = vscode.workspace.getConfiguration("CI-Script");

	/** @type {string} */
	const location = configuration.get("location") ?? "";

	// TODO: Check if path is valid (cis => CI-Script v1.0.0)
	if (!location) {
		if (!await vscode.window.showInformationMessage(Translation.MESSAGE, Translation.ACTION)) {
			return;
		}

		const quick_pick = vscode.window.createQuickPick();

		quick_pick.ignoreFocusOut = true;
		quick_pick.placeholder = Translation.PLACEHOLDER;
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
			command: configuration.get("location") ?? "",
			transport: {
				kind: TransportKind.socket,
				port: 4000
			},
			options: {
				shell: true
			}
		},
		{
			documentSelector: [
				{
					scheme: "file",
					language: "cis"
				}
			],
			synchronize: {
				fileEvents: vscode.workspace.createFileSystemWatcher("**/*.cis")
			}
		}
	);
	
	client.start();
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
			title: Translation.TITLE,
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