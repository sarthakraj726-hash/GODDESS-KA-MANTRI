const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    fs.readdirSync(commandsPath).forEach(dir => {
        const subFolderPath = path.join(commandsPath, dir);
        if (fs.lstatSync(subFolderPath).isDirectory()) {
            const commandFiles = fs.readdirSync(subFolderPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(path.join(subFolderPath, file));
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                }
            }
        }
    });
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`🔄 Refreshing ${commands.length} application (/) commands...`);

        // Deploys commands globally across your bot application configuration
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`✅ Successfully loaded ${data.length} application (/) commands globally.`);
    } catch (error) {
        console.error(error);
    }
})();