// @ts-check

const { l10n, window, workspace } = require("vscode");
const { LanguageClient, TransportKind } = require("vscode-languageclient/node");

/** @enum { string } */
const Dialog = {
	PROMPT: l10n.t("Set the path to your CI-Script installation"),
	SELECT: l10n.t("Select"),
	DISABLE: l10n.t("Don't show again")
}

/** @type { LanguageClient } */
let client;

exports.activate = async () => {
	let configuration = workspace.getConfiguration("languageServer");

	if (!configuration.get("enable")) return;

	if (!configuration.get("location")) {
		let answer = await window.showInformationMessage(Dialog.PROMPT, Dialog.SELECT, Dialog.DISABLE);

		if (!answer) return;

		if (answer == Dialog.DISABLE) {
			configuration.update("enable", false, true);
			return;
		}

		answer = (await window.showOpenDialog({
			title: Dialog.PROMPT,
			openLabel: Dialog.SELECT,
			filters: { JavaScript: ["js"] }
		}))?.[0].fsPath;

		if (!answer) return;

		await configuration.update("location", answer, true);

		configuration = workspace.getConfiguration("languageServer");
	}

	client = new LanguageClient(
		"CI-Script",
		{
			module: configuration.get("location") || "",
			transport: TransportKind.ipc
		},
		{
			documentSelector: [{ scheme: "file", language: "ci-script" }],
			synchronize: { fileEvents: workspace.createFileSystemWatcher("**/*.cis") }
		}
	);
	client.start();
};

exports.deactivate = async () => client ? await client.stop() : undefined;