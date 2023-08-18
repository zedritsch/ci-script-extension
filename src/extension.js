const VSCode = require("vscode");
const { TransportKind, LanguageClient } = require("vscode-languageclient/node");

let client;

async function activate() {
	const CONFIG = VSCode.workspace.getConfiguration("CIS.lsp");

	if (!CONFIG.get("enable")) return;

	if (CONFIG.get("installLocation") == "") {
		const MESSAGES = [VSCode.l10n.t("Don't show again"), VSCode.l10n.t("Cancel")];
		const SELECTION = await VSCode.window.showInformationMessage(
			VSCode.l10n.t("You haven't set the path to your CI-Script installation."),
			VSCode.l10n.t("Install"),
			MESSAGES[0],
			MESSAGES[1]
		);

		if (SELECTION == MESSAGES[1] || SELECTION == undefined) return;

		if (SELECTION == MESSAGES[0]) {
			CONFIG.update("enable", false, true);
			return;
		}

		// TODO: Fetch "cis.exe"
		await CONFIG.update("installLocation", __dirname + "/../lsp-sample/src/server.js", true);
		VSCode.window.showInformationMessage(
			VSCode.l10n.t("CI-Script has been successfully installed."),
			VSCode.l10n.t("Ok")
		);
	}

	const SERVER_OPTIONS = {
		module: VSCode.workspace.getConfiguration("CIS.lsp").get("installLocation"),
		transport: TransportKind.ipc
	};

	client = new LanguageClient(
		"ci-script",
		"CI-Script",
		{
			run: SERVER_OPTIONS,
			debug: SERVER_OPTIONS
		},
		{
			documentSelector: [{ language: "ci-script" }]
		}
	);

	client.start();
}

function deactivate() {
	if (!client)
		return undefined;

	return client.stop();
}

module.exports = { activate, deactivate };