chrome.commands.getAll(function (commands) {
    document.getElementById("solveShortcut").textContent = commands[1].shortcut;
    document.getElementById("pushShortcut").textContent = commands[2].shortcut;
});

chrome.storage.local.get(["push"], function ({push}) {
    document.getElementById("push").checked = push;
});

document.getElementById("change").addEventListener("click", function () {
    chrome.tabs.create({url: "chrome://extensions/shortcuts"});
});

document.getElementById("push").addEventListener("change", function () {
    chrome.storage.local.set({push: this.checked});
});
