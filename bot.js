// Imposter bot by dimden

// https://dimden.dev/ - My website
// https://discord.gg/k4u7ddk - My main discord server
// https://discord.gg/pZrRcfE - Discord for /r/imposter

/////////// UPDATED BY [@JRWR /u/xJRWR] for central data logging at spacescience.tech
// for use on the url of https://gremlins-api.reddit.com/room?nightmode=1&platform=desktop
/*
Copyright 2020 dimden

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

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
