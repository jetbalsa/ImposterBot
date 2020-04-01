// ==UserScript==
// @name         Reddit April Fools Imposter Bot
// @namespace    jrwr.io
// @version      1.0.2
// @description  A bot that randomly chooses a entry and reports back to a central database at spacescience.tech
// @author       dimden updated by jrwr
// @match        https://gremlins-api.reddit.com/room?nightmode=1&platform=desktop
// @match        https://gremlins-api.reddit.com/room?nightmode=1&platform=desktop*

// ==/UserScript==

document.getElementsByTagName("head")[0].insertAdjacentHTML(
    "beforeend",
    "<link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css\" />");

var imported = document.createElement('script');
imported.src = 'https://cdn.jsdelivr.net/npm/toastify-js';
document.head.appendChild(imported);


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
    room.options.forEach((o, i) => { 
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
Toastify({
  text: game[0] + " "+ game[1],
  duration: 1000, 
  newWindow: true,
  close: true,
  gravity: "top", // `top` or `bottom`
  position: 'left', // `left`, `center` or `right`
  backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
  stopOnFocus: false, // Prevents dismissing of toast on hover
}).showToast();

}, 1250)
setInterval(() => {
    let curstatus = getStats();
Toastify({
  text: curstatus,
  duration: 10000, 
  newWindow: true,
  close: true,
  gravity: "top", // `top` or `bottom`
  position: 'left', // `left`, `center` or `right`
  backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
  stopOnFocus: false, // Prevents dismissing of toast on hover
}).showToast();
}, 20000);
