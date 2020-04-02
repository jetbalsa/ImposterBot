// ==UserScript==
// @name         Reddit April Fools Imposter Bot
// @namespace    jrwr.io
// @version      1.1.7
// @description  A bot that randomly chooses a entry and reports back to a central database at spacescience.tech
// @author       dimden (https://dimden.dev/), jrwr (http://jrwr.io/), px, qqii, cg
// @match        https://gremlins-api.reddit.com/room?nightmode=1&platform=desktop
// @match        https://gremlins-api.reddit.com/room*
// @match        https://gremlins-api.reddit.com/results?*
// @require      https://github.com/LeoVerto/doorman/raw/master/doorman-lib.js?v=0.9
// @updateurl    https://github.com/jrwr/imposterbot/raw/master/bot.user.js
// ==/UserScript==

document.getElementsByTagName("head")[0].insertAdjacentHTML(
    "beforeend",
    "<link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css\" />");

let imported = document.createElement('script');
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
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}


async function play() {
    let room = await getRoom();
    let answer = 0,
        maxDetector = 0;

    let abraP = checkExistingAbra(room.options.flatMap(x => x[0]));
    let spacP = Promise.all(room.options.flatMap(x => checkExistingSpacescience(x[0])));
    // let deteP = Promise.all(room.options.flatMap(x => checkDetector(x[1])));
    // cost of accuracy

    let [abra, space/*, detector*/] = await Promise.all([abraP, spacP/*, deteP*/]);

    // console.table(abra);
    // console.table(space);
    // console.table(detector);

    for (let i = 0; i < room.options.length; i++) {
        // o is id
        // z is string
        let [o, z] = room.options[i];
        if (abra[i] === "known fake" || space[i] === "known fake") {
            answer = i;
            break;
        } else if (abra[i] === "known human" || space[i] === "known human") {
            continue;
        } else if (abra[i] === "unknown" && space[i] === "unknown") {
            answer = i;
            // if (detector[i] > maxDetector) {
            //     maxDetector = detector[i];
            //     answer = i;
            //     continue;
            // }
        }
    };

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

let timing = [];

function getStats() {
    const sum = timing.reduce((a, b) => a + b, 0);
    const avg = (sum / timing.length) || 0;

//     console.log(wins);
    return `All: ${wins.length+loses.length} -
Wins: ${wins.length} (${((wins.length/(wins.length+loses.length))*100).toFixed(1)}%),
Loses: ${loses.length} (${((loses.length/(wins.length+loses.length))*100).toFixed(1)}%), Time (ms): ${avg}
`;
}

window.last = "INVALID";
window.wins = []; window.loses = [];
setInterval(async () => {
    let t0 = performance.now();
    let game = await play();
    submitAnswerToDB(game[0].trim(), game[1], game[2]).then(
        function (submit) {
            let t1 = performance.now();
            timing.push(t1 - t0);
            game[0] = game[0].trim();
            if(game[1] === "WIN") wins.push(game[0]);
            else if(game[1] === "LOSE") loses.push(game[0]);
            last = game[1];
            if (game[1] == "WIN")
            {
                Toastify({
                  text: game[1] + ": "+ game[0],
                  duration: 5000,
                  newWindow: true,
                  close: true,
                  gravity: "top", // `top` or `bottom`
                  position: 'left', // `left`, `center` or `right`
                  backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
                  stopOnFocus: false, // Prevents dismissing of toast on hover
                }).showToast();
            }
            else if (game[1] == "LOSE")
            {
                Toastify({
                  text: game[1] + ": "+ game[0],
                  duration: 5000,
                  newWindow: true,
                  close: true,
                  gravity: "top", // `top` or `bottom`
                  position: 'left', // `left`, `center` or `right`
                  backgroundColor: "linear-gradient(to right, #b00023, #c93d54)",
                  stopOnFocus: false, // Prevents dismissing of toast on hover
                }).showToast();
            }
            else if (game[1] == "INVALID")
            {
                Toastify({
                  text: game[1] + ": "+ game[0],
                  duration: 5000,
                  newWindow: true,
                  close: true,
                  gravity: "top", // `top` or `bottom`
                  position: 'left', // `left`, `center` or `right`
                  backgroundColor: "linear-gradient(to right, #423e3f, #8f8b8c)",
                  stopOnFocus: false, // Prevents dismissing of toast on hover
                }).showToast();
            }
        }
    )
}, 1200)

setInterval(() => {
    let curstatus = getStats();
Toastify({
  text: curstatus,
  duration: 10000,
  newWindow: true,
  close: false,
  gravity: "bottom", // `top` or `bottom`
  position: 'right', // `left`, `center` or `right`
  backgroundColor: "linear-gradient(to right, #cf00c1, #3d49c9)",
  stopOnFocus: false, // Prevents dismissing of toast on hover
}).showToast();

    if(location.href.includes("results?") && !document.hidden) fetch(`https://gremlins-api.reddit.com/results?prev_result=${last}&nightmode=1&platform=desktop`).then(i => i.text()).then(html => {
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");
        document.getElementsByTagName("gremlin-app")[0].innerHTML = doc.getElementsByTagName("gremlin-app")[0].innerHTML;
    })
}, 10000);
