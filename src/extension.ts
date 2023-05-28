import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem | undefined;
let lastCommand: string | undefined;

export function activate(context: vscode.ExtensionContext) {
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	context.subscriptions.push(statusBarItem);

	vscode.window.onDidChangeTextEditorSelection((event: vscode.TextEditorSelectionChangeEvent) => {
		const { textEditor } = event;
		if (textEditor && textEditor.selection.isEmpty) {
			const commandName = getCommandNameFromSelection(textEditor);
			if (commandName) {
				lastCommand = commandName;
				updateStatusBar();
			}
		}
	});

	registerToggleCommand(context);
	updateStatusBar();

	// Listen for commands triggered by the user
	context.subscriptions.push(vscode.commands.registerCommand('extension.showCommand', (commandName: string) => {
		lastCommand = commandName;
		updateStatusBar();
	}));
}

function updateStatusBar() {
	const commandName = lastCommand ? `Last Command: ${lastCommand}` : 'No Command';

	vscode.window.showInformationMessage(`Display Command: ${commandName}`);

	if (statusBarItem) {
		statusBarItem.text = commandName;
		statusBarItem.show();
	}
}

function getCommandNameFromSelection(editor: vscode.TextEditor): string | undefined {
	const { document, selection } = editor;
	const selectedText = document.getText(selection);
	if (selectedText.startsWith('command:')) {
		const commandName = selectedText.slice(8);
		return commandName;
	}
	return undefined;
}

function registerToggleCommand(context: vscode.ExtensionContext) {
	const toggleCommand = vscode.commands.registerCommand('_extension.toggleDisplayCommand', () => {
		if (statusBarItem) {
			statusBarItem.dispose();
			statusBarItem = undefined;
			vscode.window.showInformationMessage('Display Command: Disabled');
		} else {
			statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
			updateStatusBar();
			context.subscriptions.push(statusBarItem);
			vscode.window.showInformationMessage('Display Command: Enabled');
		}
	});

	context.subscriptions.push(toggleCommand);
}

export function deactivate() {
	if (statusBarItem) {
		statusBarItem.dispose();
	}
}