const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily allowance of coins.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const payout = 250;

        try {
            const statement = db.prepare(`
                INSERT INTO economy (userId, guildId, balance) VALUES (?, ?, ?)
                ON CONFLICT(userId, guildId) DO UPDATE SET balance = balance + ?
            `);
            statement.run(userId, guildId, payout, payout);

            const currentBal = db.prepare('SELECT balance FROM economy WHERE userId = ? AND guildId = ?').get(userId, guildId).balance;

            await interaction.reply(`🪙 **+${payout}** added to your account! Your new balance is **${currentBal}** coins.`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to process your daily claim.', ephemeral: true });
        }
    },
};