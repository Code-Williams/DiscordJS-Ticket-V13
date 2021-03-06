// Import needed packages
const { Client, Intents, Collection } = require("discord.js");
const { red, green, yellow } = require("chalk");
const config = require("./config.json");
const db = require("quick.db");
const fs = require("fs");

// Create client with needed intents
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Register commands and events
let registeredCommands = 0;
let registeredEvents = 0;

let problemCommands = 0;
let problemEvents = 0;

client.commands = new Collection();
client.events = new Collection();

const commandsFile = fs
  .readdirSync("./items/commands")
  .filter((file) => file.endsWith(".js"));
const eventsFile = fs
  .readdirSync("./items/events")
  .filter((file) => file.endsWith(".js"));

// Call ready event
client.on("ready", () => {
  console.log(
    red(`\n[READY]`),
    green(`Bot `),
    red(client.user.tag),
    green(` is now ready\n`)
  );
  console.log(
    red(`[INFO]`),
    green(`Registered Commands: `),
    red(registeredCommands)
  );
  console.log(
    red(`[INFO]`),
    green(`Registered Events: `),
    red(registeredEvents)
  );
  console.log(red(`[INFO]`), green(`Problem Commands: `), red(problemCommands));
  console.log(red(`[INFO]`), green(`Problem Events: `), red(problemEvents));
  client.events.get("ready").execute(client);
});

client.login(config.token); // Run bot with token in config.json file

// Read and register commands & events
for (const command of commandsFile) {
  const rCommand = require(`./items/commands/${command}`);
  if (rCommand.name && rCommand.execute) {
    client.commands.set(rCommand.name, rCommand);
    console.log(
      red("[REGISTERING]"),
      green(`Command `),
      red(rCommand.name),
      green(` Registered`)
    );
    registeredCommands++;
  } else {
    console.log(
      red("[REGISTERING]"),
      yellow(`Can't Register Command `),
      red(command.replace(`.js`, ""))
    );
    problemCommands++;
  }
}

for (const event of eventsFile) {
  const rEvent = require(`./items/events/${event}`);
  if (rEvent.name && rEvent.execute) {
    client.events.set(rEvent.name, rEvent);
    console.log(
      red("[REGISTERING]"),
      green(`Events `),
      red(rEvent.name),
      green(` Registered`)
    );
    registeredEvents++;
  } else {
    console.log(
      red("[REGISTERING]"),
      yellow(`Can't Register Event `),
      red(event.replace(`.js`, ""))
    );
    problemEvents++;
  }
}

// Event for when user used a command
client.on("messageCreate", (message) => {
  if (!message.content.startsWith(db.get("prefix"))) return;
  const prefix = db.get("prefix");
  const messageArry = message.content.split(" ");
  const cmd = messageArry[0].replace(prefix, "").toLowerCase();
  if (!client.commands.get(cmd)) return;
  client.commands.get(cmd).execute(client, message);
});

// Event for when user clicked to buttons
client.on("interactionCreate", async (interaction) => {
  client.events.get("interactionCreate").execute(client, interaction);
});
