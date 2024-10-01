const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

  console.log('Extension "cropTurnTemplate" is now active!');

  let disposable = vscode.commands.registerCommand('extension.cropTurnTemplate', async function () {

    // Get the active text editor
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor detected.');
      return;
    }

    // Get the line number of the pattern
    const document = editor.document;
    const docText = document.getText();
    const patternIndex = docText.indexOf("#atlantis");
    const position = document.positionAt(patternIndex);
   
    // Ensure the input is a valid number
    let lineNumber = position.line;
    if (isNaN(lineNumber) || lineNumber < 1) {
      vscode.window.showErrorMessage('Invalid line number');
      return;
    }

    lineNumber -= 1; // Convert to zero-based index

    // Ensure the line number is within the document range
    if (lineNumber >= editor.document.lineCount) {
      vscode.window.showErrorMessage('Line number exceeds document length');
      return;
    }

    editor.edit(editBuilder => {
      const start = new vscode.Position(0, 0);
      const end = new vscode.Position(lineNumber + 1, 0);
      const range = new vscode.Range(start, end);

      editBuilder.delete(range);
    });
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};