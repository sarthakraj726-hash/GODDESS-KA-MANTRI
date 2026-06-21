const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('View temporary voice channel upgrades you can buy.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🏪 Temporary VC Upgrade Shop')
            .setDescription('Spend your active rewards to upgrade your current room! Use `/buy <item_id>` while sitting inside your temporary voice channel.')
            .setColor('#A349A4')
            .addFields(
                { name: '🔒 Lock Channel (`id: lock`)', value: 'Cost: 🪙 **500 coins**\nStops random members from connecting to your temporary room.', inline: false },
                { name: '👥 Extra Slots (`id: slots`)', value: 'Cost: 🪙 **300 coins**\nIncreases your room\'s maximum user capacity limit by **+5 slots**.', inline: false }
            )
            .setFooter({ text: 'Note: Upgrades reset completely when the temporary channel goes empty and deletes.' });

        await interaction.reply({ embeds: [embed] });
    },
};