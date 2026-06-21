const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();
const db = require('./database'); // Access our cloud database

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
client.tempChannels = new Set(); // Globally tracks dynamic temporary VCs

// 🛠️ Dynamic Command Loader
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    fs.readdirSync(commandsPath).forEach(dir => {
        const subFolderPath = path.join(commandsPath, dir);
        if (fs.lstatSync(subFolderPath).isDirectory()) {
            const commandFiles = fs.readdirSync(subFolderPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(path.join(subFolderPath, file));
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                }
            }
        }
    });
}

// 🛠️ Dynamic Event Loader
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

// 🎙️ Passive Voice Reward Engine (Runs every 60 seconds)
setInterval(async () => {
    client.guilds.cache.forEach(async (guild) => {
        try {
            await guild.members.fetch();
            
            guild.channels.cache.forEach((channel) => {
                // Check if it's a Voice or Stage channel with users inside
                if ((channel.type === 2 || channel.type === 13) && channel.members.size > 0) {
                    
                    // Anti-farming rule: Skip channels with only 1 person sitting alone
                    if (channel.members.size < 2) return;

                    channel.members.forEach((member) => {
                        // Anti-farming rule: Skip bots or members who are muted/deafened/AFK
                        if (member.user.bot || member.voice.selfDeaf || member.voice.deaf) return;

                        const coinsPerMinute = 10; // Amount of coins given out per minute

                        const statement = db.prepare(`
                            INSERT INTO economy (userId, guildId, balance) VALUES (?, ?, ?)
                            ON CONFLICT(userId, guildId) DO UPDATE SET balance = balance + ?
                        `);
                        statement.run(member.id, guild.id, coinsPerMinute, coinsPerMinute);
                    });
                }
            });
        } catch (error) {
            console.error("Error running voice reward ticker loop:", error.message);
        }
    });
}, 60000);

client.login(process.env.DISCORD_TOKEN);
