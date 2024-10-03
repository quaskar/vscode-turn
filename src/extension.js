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

  let disposable2 = vscode.commands.registerCommand('extension.sortErrorsAndEvents', async function () {

    // Get the active text editor
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor detected.');
      return;
    }

    const document = editor.document;
    const docText = document.getText();
    let Log = "";

    // Get all errors during report collapsed to single string (. separated)
    const ErrorIndex = docText.indexOf("Errors during turn:");
    let ErrorLine = document.positionAt(ErrorIndex).line + 1;
    while (document.lineAt(ErrorLine).text != "") {
      Log += "E " + document.lineAt(ErrorLine).text;
      ErrorLine++;
    }

    // Get all events during report collapsed to single string (. separated)
    const EventIndex = docText.indexOf("Events during turn:");
    let EventLine = document.positionAt(EventIndex).line + 1;
    while (document.lineAt(EventLine).text != "") {
      Log += "I " + document.lineAt(EventLine).text;
      EventLine++;
    }

    Log = Log.replaceAll("I  ", "");
    Log = Log.replaceAll("E  ", "");


    // find and insert Log lines
    let PastUnitId = []
    editor.edit(editBuilder => {
      Log.split(".").forEach((LogLine) => {
        if (LogLine != "") {
          const LogUnitId = LogLine.match(/\((\d+)\)/)[1];

          // find unit in turn template
          let UnitIndex = docText.indexOf("unit " + LogUnitId, docText.indexOf("#atlantis"));
          let UnitLine = document.positionAt(UnitIndex).line + 1;
    
          // find end of comment block of unit attributes
          while (document.lineAt(UnitLine).text[0] == ";") {
            UnitLine++;
          }

          // put separator before first Log line
          if (!PastUnitId.includes(LogUnitId)) {
            editBuilder.insert(new vscode.Position(UnitLine,0), ";---\n");
            PastUnitId.push(LogUnitId);
          }
          
          // Insert Log Message
          editBuilder.insert(new vscode.Position(UnitLine,0), ";" + LogLine + '\n');
        }
      });
    });

    return;
  });

  context.subscriptions.push(disposable2);


  const hoverProvider = vscode.languages.registerHoverProvider("turn", {
    provideHover(document, position, token) {
      const range = document.getWordRangeAtPosition(position);
      const word = document.getText(range);

      const referenceInfo = {
        "STUDY": "A command to study a skill",
        "unit": "Unit entry point"
      };

      if (word in referenceInfo) {
        return new vscode.Hover(referenceInfo[word]);
      }
      return undefined;
    }
  });

  context.subscriptions.push(hoverProvider);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};