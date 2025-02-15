import "dotenv/config";
import "path";
import fs from "fs";
import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import type { Command } from "./types";
import path from "path";

interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
}) as ExtendedClient;

client.commands = new Collection();

// Dynamically load commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".ts")); // Reads all files in commands folder and filters for only typescript files only.

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = (await import(filePath)).default as Command;

  if ('data' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARNING] The command at ${file} is missing "data".`);
  }
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }

});
