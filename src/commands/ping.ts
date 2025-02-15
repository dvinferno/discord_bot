import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { exec } from "child_process";
import type { Command } from '../types';

const command: Command = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pings a server and returns the response time.')
    .addStringOption(option =>
        option.setName('ip')
        .setDescription('The IP address or domain to ping')
        .setRequired(true)
    ) as SlashCommandBuilder,

    async execute(interaction) {
        const ip = interaction.options.getString('ip', true);
        const pingCommand = `ping -c 1 ${ip}`;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        exec(pingCommand, (error, stdout, stderr) => {
            if (error) {
              interaction.editReply(`❌ Error pinging ${ip}: ${stderr || error.message}`);
              return;
            }
      
            const match = stdout.match(/PING (.*?) \((.*?)\)/);
            const responseTimeMatch = stdout.match(/time=(\d+\.\d+) ms/);
      
            if (match && responseTimeMatch) {
              const domain = match[1];  // Domain name
              const ip = match[2];       // IP address
              const time = responseTimeMatch[1]; // Response time
      
              // Reply with the extracted IP and response time
              interaction.editReply(`Pinged **${domain}** (${ip}) - Response time: **${time} ms**`);
            } else {
              interaction.editReply('❌ Could not extract ping result.');
            }
          });
    }
}

export default command;