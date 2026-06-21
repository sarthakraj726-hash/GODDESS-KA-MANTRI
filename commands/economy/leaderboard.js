const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Display the top 10 richest members in this server.'),
    async execute(interaction) {
        const guildId = interaction.guild.id;

        try {
            const topUsers = db.prepare(`
                SELECT userId, balance FROM economy 
                WHERE guildId = ? 
                ORDER BY balance DESC 
                LIMIT 10
            `).all(guildId);

            if (topUsers.length === 0) {
                return interaction.reply({ content: 'The leaderboard is currently empty. Start chatting to earn coins!', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(`🏆 ${interaction.guild.name} Economy Leaderboard`)
                .setColor('#FFD700')
                .setTimestamp();

            let description = "";
            
            topUsers.forEach((row, index) => {
                let medal = `${index + 1}.`;
                if (index === 0) medal = '🥇';
                if (index === 1) medal = '🥈';
                if (index === 2) medal = '🥉';

                description += `${medal} <@${row.userId}> — 🪙 **${row.balance.toLocaleString()}** coins\n`;
            });

            embed.setDescription(description);
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Could not fetch the leaderboard.', ephemeral: true });
        }
    },
};
