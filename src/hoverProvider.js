const vscode = require('vscode');

class HoverProvider {
  provideHover(document, position, token) {
    console.log('Extension Turn Hover is now active!');
    return new vscode.Hover('Test hover text');
  }
}

module.exports = function(context) {
  context.subscriptions.push(vscode.languages.registerHoverProvider('turn', new HoverProvider()));
}

function activate(context) {
  console.log('Extension Turn Hover is now active!');
}

exports.activate = activate;