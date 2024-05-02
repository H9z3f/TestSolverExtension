const data = getData([
    "storage/operating-systems.json",
    "storage/web-programming.json"
]);

chrome.runtime.onConnect.addListener(function (port) {
    chrome.commands.onCommand.addListener(function (command, tab) {
        switch (command) {
            case "solve":
                port.postMessage({command: "get"});

                break;
            case "toggle-push":
                toggleNotificationAvailability();
        }
    });

    port.onMessage.addListener(function (message, port) {
        switch (message.command) {
            case "get":
                const answer = findAnswer(message.question);

                if (!answer) {
                    sendNotificationIfAvailable("The answer to this question was not found");
                }

                port.postMessage({command: "set", answer});

                break;
            case "set":
                sendNotificationIfAvailable(`Answer: ${message.answer}`);
        }
    });
});

chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (!changes.push) {
        return null;
    }

    if (changes.push.newValue) {
        sendNotification("Push-notifications: enabled");
    } else {
        sendNotification("Push-notifications: disabled");
    }
});

function getData(paths) {
    let data = {};

    paths.forEach(function (value) {
        fetch(chrome.runtime.getURL(value))
            .then(function (response) {
                return response.json();
            })
            .then(function (object) {
                data = Object.assign(data, object);
            });
    });

    return data;
}

function toggleNotificationAvailability() {
    chrome.storage.local.get(["push"], function ({push}) {
        chrome.storage.local.set({push: !push});
    });
}

function sendNotificationIfAvailable(message) {
    chrome.storage.local.get(["push"], function ({push}) {
        if (!push) {
            return;
        }

        sendNotification(message);
    });
}

function sendNotification(message) {
    chrome.notifications.create(
        "push",
        {
            type: "basic",
            iconUrl: "images/icon-64.png",
            title: "Test Solver",
            message
        },
        function () {
            setTimeout(function () {
                chrome.notifications.clear("push");
            }, 2000);
        }
    );
}

function findAnswer(question) {
    const threshold = 0.25;

    let bestMatch = null;
    let bestMatchScore = 0;

    for (const [q, a] of Object.entries(data)) {
        const score = levenshteinDistance(question, q);

        if (score > threshold) {
            continue;
        }

        if (score >= bestMatchScore) {
            bestMatch = a;
            bestMatchScore = score;

            if (score === 1) {
                break;
            }
        }
    }

    if (bestMatch) {
        return bestMatch;
    } else {
        return null;
    }
}

function levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= a.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= b.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            if (a.charAt(i - 1) === b.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[a.length][b.length] / Math.max(a.length, b.length);
}
