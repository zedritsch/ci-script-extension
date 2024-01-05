// @ts-check

const { l10n, workspace, window } = require("vscode");

const dialog = {
	title: l10n.t("Set the path to your CI-Script installation"),
	action: l10n.t("Enter a new path"),
	message: l10n.t("Failed to start the language server"),
	placeHolder: "cis"
};

exports.activate = async () => {
	const configuration = workspace.getConfiguration("CI-Script");

	// TODO: Try to start the language server
	while (configuration.get("location") != "cis") {
		const answer = await window.showInformationMessage(dialog.message, dialog.action) && await window.showInputBox(dialog);

		if (!answer) {
			return;
		}

		await configuration.update("location", answer, true);
	}
};