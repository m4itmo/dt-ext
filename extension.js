const vscode = require('vscode')
const axios = require("axios")

/** @param {vscode.ExtensionContext} context */
async function activate(context) {
	let disposable = vscode.commands.registerCommand(
		"dt-ext.searchOnStackOverflow",
		async function () {
			const searchQuery = await vscode.window.showInputBox({
				placeHolder: "Search query",
				prompt: "Search my snippets on Codever",
				value: ""
			})
			
			if (!searchQuery) {
				console.log(searchQuery)
				vscode.window.showErrorMessage('No search query specified')
				return
			}

			const searchUrl = `https://api.stackexchange.com/search/advanced?site=stackoverflow.com&q=${searchQuery}`

			const res = await axios.get(searchUrl)

			if (res.data.quota_remaining / res.data.quota_max < 0.8) {
				vscode.window.showInformationMessage(
					"Quatas remaining " + res.data.quota_remaining + "/" + res.data.quota_max + "",
					// "What is quata?"  // TODO: to ad explanation (Quata is the maximum number of API calls allowed per day per IP-address)
				)
			}
			vscode.window.showInformationMessage("Found " + res.data.items.length + " answer" + ((res.data.items.length === 1) ? "" : "s"))

			if (!res.data.items.length) {
				return
			}

			const items = res.data.items.map(item => {
				return {
					label: item.title,
					detail: (item.is_answered ? "Answered" : "Not answered") + "\ntags: " + item.tags.join(', '),
					link: item.link,
				}
			})

			const article = await vscode.window.showQuickPick(items, {
				matchOnDetail: true,
			})

			if (article == null) return
			
			vscode.env.openExternal(article.link)
		}
	)

	context.subscriptions.push(disposable)
}
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
