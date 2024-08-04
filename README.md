
# coup-bot

A fan made version of the game Coup for discord. Play the official game in person, it's a lot of fun!
[The official rules are here](https://www.qugs.org/rules/r131357.pdf)

## Running this bot

First you're going to need to make sure you have Node.js installed

```bash
  node -v
```
if the version is v16.11.0 or higher, you're all good, otherwise install/update it [here](https://nodejs.org/en)


Next you're going to need discord.js installed, run
```bash
  npm install discord.js
```
#

Next you're going to need to sign into the [discord developer portal](https://discord.com/developers/) and make your discord bot there, you can call it whatever you want and give it a nice profile picture!

You can follow the instructions [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot), after setting it up you'll need to copy the CLIENT TOKEN (don't let anyone else see this!!)


Navigate to wherever you've extracted this project and open the config.json file

```bash
  {
	"token": "PUT UR TOKEN HERE",
    "clientId": "CLIENT ID HERE",
	"guildId": "ID OF BOTS HOME SERVER HERE",
	"cardType":  ["captain", "assassin", "ambassador", "duke", "contessa"], 
	"cardEmoji": ["🟦", "⬛", "🟩", "🟪", "🟥"],
	"thinkingTime" : 120000
}
```
it should look like this, replace the token field with your bots secret token, and replace the clientId with its clientId.

To find the Id of the bots home server (you're going to need discord dev mode turned on in the settings), right click on the server icon and click copy server id, put that in the guildId field.

Leave cardType as is, changing this will change what the roles are called and can be confusing. If you want the emoji's to look like the role emojis, you'll need to go into the /assets folder and upload each of these images as a custom emoji to your server, then get their ids by going into your server and sending a message of
```bash
  \:captain:
```
(assuming you called your captain emoji captain), copy that message and replace the blue square with that. THE ORDER MATTERS, the emojis are in the order 
```bash
  captain, assassin, ambassador, duke, contessa
```
and should look like this when you're done
```bash
"cardEmoji": ["<:captain:1253780126081089649>", "<:assassin:1253779672861245603>", "<:ambassador:1253779650522386552>", "<:duke:1253779856140009482>", "<:contessa:1253779825928441896>"],
```

Feel free to tweak the thinking time as you see fit, it's measured in milliseconds, so the 120000 set by default is 2 minutes.

Save your changes when you're done!
#

Next you'll need to add your bot to your home server
```
https://discord.com/api/oauth2/authorize?client_id=YOUR CLIENT ID HERE&permissions=448824461376&scope=bot%20applications.commands
```
Replace YOUR CLIENT ID HERE with your actual client id, the permissions field is filled in with every permission the bot should need, if you'd like to change this go to the bot -> bot permsissions section of your discord dev portal and click the permissions you want to give the bot and copy the final permissions integer, replace the 448824461376 with the integer you've copied.

After that your bot should be in the server!
#

Finally you'll just need to run two more commands, first open your terminal and navigate to where the project is located and run
```bash
  node deploy-commands.js
```
this sends all the commands to discord so it knows what commands this bot should support.

Then to run the bot do
```bash
  node .
```
crtl + c will kill the bot, otherwise the bot should be all working!
## Acknowledgements

 - [Discord.js (an excellent guide that got me set up with discords API)](https://discordjs.guide/)
 - [La Mame Games for making such an incredible game (seriously, buy the physical version, it's so much more fun!)](https://sites.google.com/view/la-mame-games/home?authuser=0)
 - My friend Joe for giving me this cool idea (it took a little longer than 1 evening lmao)

