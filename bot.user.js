// ==UserScript==
// @name         Reddit April Fools Imposter Bot
// @namespace    jrwr.io
// @version      1.0.0
// @description  A bot that randomly chooses a entry and reports back to a central database at spacescience.tech
// @author       dimden updated by jrwr
// @match        https://gremlins-api.reddit.com/room?nightmode=1&platform=desktop
// @match        https://gremlins-api.reddit.com/room?nightmode=1&platform=desktop*

// ==/UserScript==


async function getRoom() {
    let res = await (await fetch("https://gremlins-api.reddit.com/room?nightmode=1&platform=desktop")).text();
    let parser = new DOMParser();
    let doc = parser.parseFromString(res, "text/html");

    return {
        token: doc.getElementsByTagName("gremlin-app")[0].getAttribute("csrf"),
        options: Array.from(doc.getElementsByTagName("gremlin-note")).map(e => [e.id, e.innerText])
    };
};
async function submitAnswer(token, id) {
    let body = new FormData();
    body.append("undefined", "undefined");
    body.append("note_id", id);
    body.append("csrf_token", token);
    let res = await (await fetch("https://gremlins-api.reddit.com/submit_guess", {
        method: "post",
        body
    })).text();

    return JSON.parse(res);
}
async function play() {
    let room = await getRoom();
    let answer = 0, found = false;
    room.options.forEach((o, i) => { // shit, predicts badly (gonna update soon)
        if(!found && !o[1].startsWith("i") && !o[1].endsWith("?")) {
            found = true;
            answer = i;
        }
    });
    let result = await submitAnswer(room.token, room.options[answer][0]);

    return [room.options[answer][1], result.result, room];
};

async function submitAnswerToDB(answer, result, room) {
    let body = new FormData();
    delete room.token;
    body.append("answer", answer);
    body.append("result", result);
    body.append("room", JSON.stringify(room));
    let res = await (await fetch("https://spacescience.tech/api.php", {
        method: "post",
        body
    })).text();

    return JSON.parse(res);
}
function getStats() {
    console.log(wins);
    return `All: ${wins.length+loses.length}
Wins: ${wins.length} (${((wins.length/(wins.length+loses.length))*100).toFixed(1)}%)
Loses: ${loses.length} (${((loses.length/(wins.length+loses.length))*100).toFixed(1)}%)
`;
}

let wins = [], loses = [];
setInterval(async () => {
    let game = await play();
    let submit = await submitAnswerToDB(game[0].trim(), game[1], game[2]);
    game[0] = game[0].trim();
    if(game[1] === "WIN") wins.push(game[0]);
    else if(game[1] === "LOSE") loses.push(game[0]);
}, 1250)
setInterval(() => {console.log(getStats())}, 20000);
