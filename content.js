const cursor = {};

document.addEventListener("mousemove", function (evt) {
    cursor.x = evt.clientX;
    cursor.y = evt.clientY;
});

const port = chrome.runtime.connect({name: "TestSolver"});
port.onMessage.addListener(function (message, port) {
    switch (message.command) {
        case "get":
            port.postMessage({command: "get", question: document.elementFromPoint(cursor.x, cursor.y).textContent});

            break;
        case "set":
            if (!message.answer) {
                navigator.clipboard.writeText("No answer found");

                return;
            }

            navigator.clipboard.writeText(message.answer);

            port.postMessage({command: "set", answer: message.answer});
    }
});
