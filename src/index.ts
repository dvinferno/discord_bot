import 'dotenv/config'
import 'path';
import fs from 'fs';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import type { Command } from './types';
import path from 'path';
import { file } from 'bun';

interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] }) as ExtendedClient;

client.commands = new Collection()

// Dynamically load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts')); // Reads all files in commands folder and filters for only typescript files only.

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = (await import(filePath)).default as Command;

  if (command?.data) {
    client.commands.set(command.data.name, command)
    
  } else {
    console.warn(`[WARNING] The command at ${file} is missing "data".`)
  }
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);