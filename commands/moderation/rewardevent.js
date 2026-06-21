const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rewardevent')
        .setDescription('Payout bonus coins to all members sitting in a specific VC right now.')
        .addChannelOption(opt => 
            opt.setName('channel')
               .setDescription('Select the target Event Voice Channel')
               .setRequired(true)
        )
        .addIntegerOption(opt => 
            opt.setName('amount')
               .setDescription('Amount of prize coins to hand out')
               .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        
    async execute(interaction) {
        const targetChannel = interaction.options.getChannel('channel');
        const prizeAmount = interaction.options.getInteger('amount');

        if (targetChannel.type !== 2 && targetChannel.type !== 13) {
            return interaction.reply({ content: '❌ Target must be a standard Voice Channel or Stage Channel.', ephemeral: true });
        }

        const membersInVC = targetChannel.members;

        if (membersInVC.size === 0) {
            return interaction.reply({ content: '❌ No active users were detected in that channel right now.', ephemeral: true });
        }

        let rewardedCount = 0;

        membersInVC.forEach((member) => {
            if (member.user.bot) return;

            const statement = db.prepare(`
                INSERT INTO economy (userId, guildId, balance) VALUES (?, ?, ?)
                ON CONFLICT(userId, guildId) DO UPDATE SET balance = balance + ?
            `);
            statement.run(member.id, interaction.guild.id, prizeAmount, prizeAmount);
            rewardedCount++;
        });

        await interaction.reply({
            content: `🎉 Successfully distributed 🪙 **${prizeAmount} coins** to all **${rewardedCount}** active participants inside **${targetChannel.name}**!`
        });
    },
};