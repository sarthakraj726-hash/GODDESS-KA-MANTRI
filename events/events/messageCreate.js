const { Events } = require('discord.js');
const db = require('../database');

const textCooldowns = new Map();

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (!message.guild || message.author.bot) return;

        const userId = message.author.id;
        const guildId = message.guild.id;
        const now = Date.now();
        const cooldownTime = 60000; // 1-minute anti-spam cooldown

        if (textCooldowns.has(userId)) {
            const expirationTime = textCooldowns.get(userId) + cooldownTime;
            if (now < expirationTime) return; 
        }

        textCooldowns.set(userId, now);

        // Award a random amount between 5 and 15 coins per minute of chatting
        const coinsEarned = Math.floor(Math.random() * 11) + 5;

        try {
            const statement = db.prepare(`
                INSERT INTO economy (userId, guildId, balance) VALUES (?, ?, ?)
                ON CONFLICT(userId, guildId) DO UPDATE SET balance = balance + ?
            `);
            statement.run(userId, guildId, coinsEarned, coinsEarned);
        } catch (error) {
            console.error("Error saving text economy payout:", error.message);
        }
    },
};