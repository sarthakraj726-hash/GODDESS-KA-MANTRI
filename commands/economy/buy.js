const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Purchase a temporary VC room upgrade.')
        .addStringOption(opt => 
            opt.setName('item_id')
               .setDescription('The ID code of the shop item')
               .setRequired(true)
               .addChoices(
                   { name: '🔒 Lock Channel (500 coins)', value: 'lock' },
                   { name: '👥 Extra Slots (300 coins)', value: 'slots' }
               )
        ),
    async execute(interaction) {
        const itemId = interaction.options.getString('item_id');
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: '❌ You must be connected to your temporary voice channel to buy upgrades.', ephemeral: true });
        }

        if (!interaction.client.tempChannels.has(voiceChannel.id)) {
            return interaction.reply({ content: '❌ This command can only be used inside a generated temporary Voice Channel.', ephemeral: true });
        }

        const memberPerms = voiceChannel.permissionsFor(interaction.member);
        if (!memberPerms.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: '❌ Only the original creator/manager of this room can purchase upgrades for it.', ephemeral: true });
        }

        const items = {
            lock: { cost: 500 },
            slots: { cost: 300 }
        };

        const chosenItem = items[itemId];
        const userRow = db.prepare('SELECT balance FROM economy WHERE userId = ? AND guildId = ?').get(userId, guildId);
        const currentBalance = userRow ? userRow.balance : 0;

        if (currentBalance < chosenItem.cost) {
            return interaction.reply({ content: `❌ Insufficient funds. This costs 🪙 **${chosenItem.cost}** coins, but you only have 🪙 **${currentBalance}**.`, ephemeral: true });
        }

        try {
            db.prepare('UPDATE economy SET balance = balance - ? WHERE userId = ? AND guildId = ?').run(chosenItem.cost, userId, guildId);

            if (itemId === 'lock') {
                await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    Connect: false
                });
                await interaction.reply({ content: `🔒 **Purchase Successful!** Spent 🪙 **500 coins**. Your temporary room has been locked to outsiders.` });
            } 
            else if (itemId === 'slots') {
                const currentLimit = voiceChannel.userLimit;
                const newLimit = currentLimit === 0 ? 5 : currentLimit + 5;
                
                await voiceChannel.setUserLimit(newLimit);
                await interaction.reply({ content: `👥 **Purchase Successful!** Spent 🪙 **300 coins**. Max room capacity increased to **${newLimit} members**.` });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred during processing your purchase.', ephemeral: true });
        }
    },
};