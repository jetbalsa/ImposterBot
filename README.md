# ImposterBot

This bot uses and sends data from https://spacescience.techto find the imposter! Average winrate: 75%.

## Usage:

1. Install TamperMonkey: https://www.tampermonkey.net/
2. Browse to this: https://github.com/JRWR/ImposterBot/raw/master/bot.user.js
3. Click Install
4. Go to https://gremlins-api.reddit.com/results?prev_result=WIN&nightmode=1&platform=desktop
5. It will display all the requests its sending and its success rate

## Semiauto ImposterBot

Additionally to the fully automatic ImposterBot, we have a semiautomatic version, which will ask you when it's unsure due to not knowing multiple answers.
Since this version will show you the answer interface as well, it is recommended to install the Doorman script.

To Install the Semiauto script:

1. Install TamperMonkey: https://www.tampermonkey.net/
2. Browse to this: https://github.com/JRWR/ImposterBot/raw/master/semiauto.user.js
3. Click Install
4. Go to https://gremlins-api.reddit.com/results?prev_result=WIN&nightmode=1&platform=desktop
5. It will display all the requests its sending and its success rate 

To install the optional Doorman script:

1. Visit https://github.com/LeoVerto/doorman/raw/master/doorman.user.js
2. Click Install
3. Open the dashboard (chrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo/options.html#nav=dashboard)
4. Press the 'Edit' icon on "Doorman - Imposter Helper" (far right)
5. Replace `// @include      https://gremlins-api.reddit.com/*` with `// @include      https://gremlins-api.reddit.com/room*`

### PRs WELCOME!!
